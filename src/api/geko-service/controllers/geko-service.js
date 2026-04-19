'use strict';

/**
 * geko-service controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::geko-service.geko-service', ({ strapi }) => ({
  async find(ctx) {
    ctx.query.populate = '*';
    return super.find(ctx);
  }
}));

