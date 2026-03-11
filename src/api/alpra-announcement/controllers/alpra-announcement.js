'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::alpra-announcement.alpra-announcement', ({ strapi }) => ({
  async find(ctx) {
    ctx.query.populate = '*';
    return super.find(ctx);
  }
}));
