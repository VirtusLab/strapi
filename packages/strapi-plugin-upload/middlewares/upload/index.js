'use strict';

const { resolve } = require('path');
const range = require('koa-range');
const koaStatic = require('koa-static');
const { IncomingForm } = require('formidable');
const { PassThrough } = require('stream');

const formidableOptions = {
  keepExtensions: true,
};

class StorageStream extends PassThrough {
  constructor(opts) {
    super(opts);
    this.buff = null;
  }

  pipe(dest, option = {}) {
    if (option._original) {
      return super.pipe(dest, option);
    }
    new StorageStream().end(this.toBuffer()).pipe(dest, { ...option, _original: true });
  }

  toBuffer() {
    if (this.buff) {
      return this.buff;
    }
    const result = [];
    let chunk;
    while (null !== (chunk = this.read())) {
      result.push(chunk);
    }
    this.buff = Buffer.concat(result);
    return this.buff;
  }

  toString() {
    return this.toBuffer().toString();
  }

  toJSON() {
    return this.toBuffer().toString();
  }

  toObject() {
    try {
      const value = this.toString();
      return JSON.parse(value);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  clone() {
    const stream = new StorageStream();
    stream.end(this.toBuffer());
    return stream;
  }

  destroy(error) {
    this.buff = null;
    super.destroy(error);
  }
}

const parseRequest = req => {
  return new Promise(resolve => {
    const form = new IncomingForm(formidableOptions);
    let result = {};
    form.onPart = part => {
      const storageStream = new StorageStream();
      storageStream.setDefaultEncoding(part.transferEncoding);
      part.on('data', buffer => {
        if (buffer.length === 0) {
          return;
        }
        form.pause();
        storageStream.push(buffer);
        result[part.name].size += buffer.length;
        form.resume();
      });
      part.on('end', () => {
        storageStream.push(null);
        storageStream.end();
      });
      result[part.name] = {
        stream: storageStream,
        fileName: part.filename,
        name: part.filename,
        mimeType: part.mime,
        type: part.mime,
        isStream: true,
        size: 0,
      };
    };
    form.parse(req);
    req.on('end', () => {
      resolve(result);
    });
  });
};

module.exports = strapi => ({
  initialize() {
    const configPublicPath = strapi.config.get(
      'middleware.settings.public.path',
      strapi.config.paths.static
    );
    const staticDir = resolve(strapi.dir, configPublicPath);
    const isStreamEnabled =
      strapi.plugins.upload.services.upload.getPluginConfig().streams === true;

    strapi.app.on('error', err => {
      if (err.code === 'EPIPE') {
        // when serving audio or video the browsers sometimes close the connection to go to range requests instead.
        // This causes koa to emit a write EPIPE error. We can ignore it.
        // Right now this ignores it globally and we cannot do much more because it is how koa handles it.
        return;
      }

      strapi.app.onerror(err);
    });
    strapi.router.get('/uploads/(.*)', range, koaStatic(staticDir, { defer: true }));
    strapi.app.use(async (ctx, next) => {
      if (isStreamEnabled && ctx.url.startsWith('/upload') && ctx.method.toLowerCase() === 'post') {
        const result = await parseRequest(ctx.req);
        ctx.request.files = { files: result.files };
        const fileInfo = { fileInfo: result.fileInfo.stream.toObject() };
        ctx.request.body = fileInfo;
        ctx.body = fileInfo;
      }
      return next();
    });
  },
});
