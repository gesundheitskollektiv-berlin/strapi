'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::geko-cta.geko-cta', ({ strapi }) => ({
  async find(ctx) {
    ctx.query.populate = '*';
    return super.find(ctx);
  }
}));
