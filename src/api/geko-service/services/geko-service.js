'use strict';

/**
 * geko-service service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::geko-service.geko-service');

