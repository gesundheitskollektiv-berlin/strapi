'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::geko-page-landing.geko-page-landing', ({ strapi }) => ({
  async find(ctx) {
    ctx.query.populate = { content: { populate: '*' } };
    return super.find(ctx);
  }
}));


