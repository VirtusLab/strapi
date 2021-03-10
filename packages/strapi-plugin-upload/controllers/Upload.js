'use strict';

/**
 * Upload.js controller
 *
 */

const _ = require('lodash');
const { sanitizeEntity } = require('strapi-utils');
const apiUploadController = require('./upload/api');
const adminUploadController = require('./upload/admin');

const resolveController = ctx => {
  const {
    state: { isAuthenticatedAdmin },
  } = ctx;

  return isAuthenticatedAdmin ? adminUploadController : apiUploadController;
};

const resolveControllerMethod = method => ctx => {
  const controller = resolveController(ctx);
  const callbackFn = controller[method];

  if (!_.isFunction(callbackFn)) {
    return ctx.notFound();
  }

  return callbackFn(ctx);
};

module.exports = {
  find: resolveControllerMethod('find'),
  findOne: resolveControllerMethod('findOne'),
  count: resolveControllerMethod('count'),
  destroy: resolveControllerMethod('destroy'),
  updateSettings: resolveControllerMethod('updateSettings'),
  getSettings: resolveControllerMethod('getSettings'),
  getUploadConfig: resolveControllerMethod('getUploadConfig'),

  async upload(ctx) {
    const isUploadDisabled =
      strapi.plugins.upload.services.upload.getPluginConfig().enabled === false;

    const {
      supportFormat,
      supportFormatOptions,
    } = await strapi.plugins.upload.services.upload.getSettings();

    if (isUploadDisabled) {
      throw strapi.errors.badRequest(null, {
        errors: [{ id: 'Upload.status.disabled', message: 'File upload is disabled' }],
      });
    }

    const {
      query: { id },
      request: { files: { files } = {} },
    } = ctx;

    if (files) {
      const condition = supportFormatOptions
        .filter(({ label }) => supportFormat.includes(label))
        .some(({ regex }) => new RegExp(regex).test(files.type));
      if (!condition) {
        throw strapi.errors.badRequest(null, {
          errors: [{ id: 'Upload.format.notSupported', message: 'File format is not supported.' }],
        });
      }
    }

    const controller = resolveController(ctx);

    if (id && (_.isEmpty(files) || files.size === 0)) {
      return controller.updateFileInfo(ctx);
    }

    if (_.isEmpty(files) || files.size === 0) {
      throw strapi.errors.badRequest(null, {
        errors: [{ id: 'Upload.status.empty', message: 'Files are empty' }],
      });
    }

    await (id ? controller.replaceFile : controller.uploadFiles)(ctx);
  },

  async search(ctx) {
    const { id } = ctx.params;
    const model = strapi.getModel('file', 'upload');
    const entries = await strapi.query('file', 'upload').custom(searchQueries)({
      id,
    });

    ctx.body = sanitizeEntity(entries, { model });
  },
};

const searchQueries = {
  bookshelf({ model }) {
    return ({ id }) => {
      return model
        .query(qb => {
          qb.whereRaw('LOWER(hash) LIKE ?', [`%${id}%`]).orWhereRaw('LOWER(name) LIKE ?', [
            `%${id}%`,
          ]);
        })
        .fetchAll()
        .then(results => results.toJSON());
    };
  },
  mongoose({ model }) {
    return ({ id }) => {
      const re = new RegExp(id, 'i');

      return model
        .find({
          $or: [{ hash: re }, { name: re }],
        })
        .lean();
    };
  },
};
