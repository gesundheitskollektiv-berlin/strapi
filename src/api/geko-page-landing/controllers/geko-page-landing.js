'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::geko-page-landing.geko-page-landing', ({ strapi }) => ({
  async find(ctx) {
    ctx.query.populate = {
      content: {
        on: {
          'geko-page-blocks.welcome': true,
          'geko-page-blocks.about': {
            populate: { team_image: true }
          },
          'geko-page-blocks.calendar': true,
          'geko-page-blocks.news': true,
          'geko-page-blocks.services': true,
          'geko-page-blocks.cta': {
            populate: {
              geko_cta: { populate: '*' }
            }
          },
        }
      }
    };
    return super.find(ctx);
  }
}));


