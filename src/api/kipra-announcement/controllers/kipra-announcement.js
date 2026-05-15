'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::kipra-announcement.kipra-announcement', ({ strapi }) => ({
  async find(ctx) {
    ctx.query.populate = '*';
    return super.find(ctx);
  }
}));
