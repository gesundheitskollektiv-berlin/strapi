'use strict';

/**
 * geko-announcement service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::geko-announcement.geko-announcement');

