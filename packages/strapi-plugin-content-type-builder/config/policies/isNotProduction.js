const { env } = require('strapi-utils');

module.exports = async (ctx, next) => {
  if (env('NODE_ENV') !== 'production') {
    return await next();
  }
  ctx.badRequest();
};
