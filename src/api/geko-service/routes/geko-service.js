'use strict';

/**
 * geko-service router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::geko-service.geko-service');

