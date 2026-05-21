'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::alpra-page-landing.alpra-page-landing', ({ strapi }) => ({
  async find(ctx) {
    ctx.query.populate = {
      content: {
        on: {
          'alpra-page-blocks.welcome': true,
          'alpra-page-blocks.announcements': true,
          'alpra-page-blocks.services': true,
          'alpra-page-blocks.about': true,
          'alpra-page-blocks.contact': { populate: { images: true } },
          'alpra-page-blocks.footer': true,
          'alpra-page-blocks.sprechstunden': {
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
