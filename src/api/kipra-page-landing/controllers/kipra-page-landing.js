'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::kipra-page-landing.kipra-page-landing', ({ strapi }) => ({
  async find(ctx) {
    ctx.query.populate = {
      content: {
        on: {
          'kipra-page-blocks.welcome': true,
          'kipra-page-blocks.announcements': true,
          'kipra-page-blocks.termine': true,
          'kipra-page-blocks.services': true,
          'kipra-page-blocks.about': true,
          'kipra-page-blocks.contact': true,
          'kipra-page-blocks.footer': true,
          'kipra-page-blocks.sprechstunden': {
            populate: {
              sprechstunden: {
                populate: {
                  days: {
                    populate: {
                      sprechzeiten: {
                        populate: {
                          doctors: { populate: '*' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    return super.find(ctx);
  }
}));
