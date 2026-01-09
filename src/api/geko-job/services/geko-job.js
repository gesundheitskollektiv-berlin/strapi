'use strict';

/**
 * geko-job service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::geko-job.geko-job');
