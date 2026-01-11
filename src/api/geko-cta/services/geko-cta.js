'use strict';

/**
 * geko-cta service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::geko-cta.geko-cta');
