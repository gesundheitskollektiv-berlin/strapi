'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::geko-meta.geko-meta', ({ strapi }) => ({
  async find(ctx) {
    ctx.query.populate = '*';
    return super.find(ctx);
  }
}));






