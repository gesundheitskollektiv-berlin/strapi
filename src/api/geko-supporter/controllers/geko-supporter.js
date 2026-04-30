'use strict';

/**
 * geko-supporter controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::geko-supporter.geko-supporter', ({ strapi }) => ({
  async find(ctx) {
    ctx.query.populate = '*';
    return super.find(ctx);
  }
}));
