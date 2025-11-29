import type { Schema, Struct } from '@strapi/strapi';

export interface GekoPageBlocksAbout extends Struct.ComponentSchema {
  collectionName: 'components_geko_page_blocks_abouts';
  info: {
    description: '';
    displayName: 'About';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface GekoPageBlocksCalendar extends Struct.ComponentSchema {
  collectionName: 'components_geko_page_blocks_calendars';
  info: {
    description: '';
    displayName: 'Calendar';
  };
  attributes: {
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface GekoPageBlocksContact extends Struct.ComponentSchema {
  collectionName: 'components_geko_page_blocks_contacts';
  info: {
    description: '';
    displayName: 'Contact';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface GekoPageBlocksNeighbours extends Struct.ComponentSchema {
  collectionName: 'components_geko_page_blocks_neighbours';
  info: {
    description: '';
    displayName: 'Neighbours';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface GekoPageBlocksNews extends Struct.ComponentSchema {
  collectionName: 'components_geko_page_blocks_news';
  info: {
    description: '';
    displayName: 'Announcements';
  };
  attributes: {
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface GekoPageBlocksServices extends Struct.ComponentSchema {
  collectionName: 'components_geko_page_blocks_services';
  info: {
    description: '';
    displayName: 'Services';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface GekoPageBlocksWelcome extends Struct.ComponentSchema {
  collectionName: 'components_geko_page_blocks_welcomes';
  info: {
    description: '';
    displayName: 'Welcome';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'geko-page-blocks.about': GekoPageBlocksAbout;
      'geko-page-blocks.calendar': GekoPageBlocksCalendar;
      'geko-page-blocks.contact': GekoPageBlocksContact;
      'geko-page-blocks.neighbours': GekoPageBlocksNeighbours;
      'geko-page-blocks.news': GekoPageBlocksNews;
      'geko-page-blocks.services': GekoPageBlocksServices;
      'geko-page-blocks.welcome': GekoPageBlocksWelcome;
    }
  }
}
