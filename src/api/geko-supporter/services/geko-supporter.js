'use strict';

/**
 * geko-supporter service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::geko-supporter.geko-supporter');
