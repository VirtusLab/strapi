'use strict';

const body = require('koa-body');
const qs = require('qs');
const { omit, get } = require('lodash');

/**
 * Body parser hook
 */
const addQsParser = (app, settings) => {
  Object.defineProperty(app.request, 'query', {
    configurable: false,
    enumerable: true,
    /*
     * Get parsed query-string.
     */
    get() {
      const qstr = this.querystring;
      const cache = (this._querycache = this._querycache || {});
      return cache[qstr] || (cache[qstr] = qs.parse(qstr, settings));
    },

    /*
     * Set query-string as an object.
     */
    set(obj) {
      this.querystring = qs.stringify(obj);
    },
  });

  return app;
};

module.exports = strapi => {
  return {
    /**
     * Initialize the hook
     */
    initialize() {
      const configUploadConfig = get(strapi.plugins, 'upload.config', {});
      strapi.app.use(async (ctx, next) => {
        // disable for graphql
        // TODO: find a better way later
        if (ctx.url === '/graphql') {
          return next();
        }
        // we can parse req only once, if we have enabled streams we don't need koa-body middleware on this endpoint
        if (
          configUploadConfig.streams === true &&
          ctx.url.startsWith('/upload') &&
          ctx.method.toLowerCase() === 'post'
        ) {
          return next();
        }

        try {
          const res = await body({
            patchKoa: true,
            ...omit(strapi.config.middleware.settings.parser, 'queryStringParser'),
          })(ctx, next);
          return res;
        } catch (e) {
          if (e.message.includes('maxFileSize exceeded')) {
            throw strapi.errors.entityTooLarge('FileTooBig', {
              errors: [
                {
                  id: 'Upload.status.sizeLimit',
                  message: `file is bigger than the limit size!`,
                },
              ],
            });
          }
          throw e;
        }
      });

      addQsParser(strapi.app, strapi.config.get('middleware.settings.parser.queryStringParser'));
    },
  };
};
