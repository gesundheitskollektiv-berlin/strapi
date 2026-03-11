'use strict';

/**
 * alpra-personnel controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::alpra-personnel.alpra-personnel', ({ strapi }) => ({
  async find(ctx) {
    ctx.query.populate = '*';
    return super.find(ctx);
  }
}));
