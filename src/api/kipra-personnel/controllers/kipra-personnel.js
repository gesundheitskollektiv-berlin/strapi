'use strict';

/**
 * kipra-personnel controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::kipra-personnel.kipra-personnel', ({ strapi }) => ({
  async find(ctx) {
    ctx.query.populate = '*';
    return super.find(ctx);
  }
}));
