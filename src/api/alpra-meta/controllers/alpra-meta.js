'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::alpra-meta.alpra-meta', ({ strapi }) => ({
  async find(ctx) {
    ctx.query.populate = '*';
    return super.find(ctx);
  }
}));
