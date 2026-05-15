'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::kipra-meta.kipra-meta', ({ strapi }) => ({
  async find(ctx) {
    ctx.query.populate = '*';
    return super.find(ctx);
  }
}));
