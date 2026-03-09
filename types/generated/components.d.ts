import type { Schema, Struct } from '@strapi/strapi';

export interface AlpraPageBlocksPraxistag extends Struct.ComponentSchema {
  collectionName: 'components_alpra_page_blocks_praxistags';
  info: {
    displayName: 'Sprechtag';
  };
  attributes: {
    day: Schema.Attribute.String;
    sprechzeiten: Schema.Attribute.Component<'alpra-page-blocks.slot', true>;
  };
}

export interface AlpraPageBlocksSlot extends Struct.ComponentSchema {
  collectionName: 'components_alpra_page_blocks_slots';
  info: {
    displayName: 'Sprechzeit';
  };
  attributes: {
    annotation: Schema.Attribute.String;
    description: Schema.Attribute.String;
    doctors: Schema.Attribute.Relation<
      'oneToMany',
      'api::alpra-personnel.alpra-personnel'
    >;
    end: Schema.Attribute.String;
    start: Schema.Attribute.String;
  };
}

export interface AlpraPageBlocksSprechstundenart
  extends Struct.ComponentSchema {
  collectionName: 'components_alpra_page_blocks_sprechstundenarts';
  info: {
    displayName: 'Sprechstundenart';
  };
  attributes: {
    days: Schema.Attribute.Component<'alpra-page-blocks.praxistag', true>;
    description: Schema.Attribute.Blocks;
    name: Schema.Attribute.String;
  };
}

export interface GekoPageBlocksAbout extends Struct.ComponentSchema {
  collectionName: 'components_geko_page_blocks_abouts';
  info: {
    description: '';
    displayName: 'About';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['white', 'red', 'yellow', 'blue', 'green']
    >;
    content: Schema.Attribute.Blocks;
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    team_image: Schema.Attribute.Media<'images'>;
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
    background_color: Schema.Attribute.Enumeration<
      ['white', 'red', 'yellow', 'blue', 'green']
    >;
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
    background_color: Schema.Attribute.Enumeration<
      ['white', 'red', 'yellow', 'blue', 'green']
    >;
    content: Schema.Attribute.Blocks;
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface GekoPageBlocksCta extends Struct.ComponentSchema {
  collectionName: 'components_geko_page_blocks_ctas';
  info: {
    displayName: 'CTA';
  };
  attributes: {
    geko_cta: Schema.Attribute.Relation<'oneToOne', 'api::geko-cta.geko-cta'>;
  };
}

export interface GekoPageBlocksFooter extends Struct.ComponentSchema {
  collectionName: 'components_geko_page_blocks_footers';
  info: {
    displayName: 'Footer';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['white', 'red', 'yellow', 'blue', 'green']
    >;
  };
}

export interface GekoPageBlocksFundingProject extends Struct.ComponentSchema {
  collectionName: 'components_geko_page_blocks_funding_projects';
  info: {
    displayName: 'Funding Project';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'>;
    project_url: Schema.Attribute.String;
    title: Schema.Attribute.String;
    width: Schema.Attribute.Enumeration<['half', 'full']> &
      Schema.Attribute.DefaultTo<'half'>;
  };
}

export interface GekoPageBlocksJobs extends Struct.ComponentSchema {
  collectionName: 'components_geko_page_blocks_jobs';
  info: {
    displayName: 'Jobs';
    icon: 'chartPie';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['white', 'red', 'yellow', 'blue', 'green']
    > &
      Schema.Attribute.DefaultTo<'white'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface GekoPageBlocksNeighbours extends Struct.ComponentSchema {
  collectionName: 'components_geko_page_blocks_neighbours';
  info: {
    description: '';
    displayName: 'Neighbours';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['white', 'red', 'yellow', 'blue', 'green']
    >;
    content: Schema.Attribute.Blocks;
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
    background_color: Schema.Attribute.Enumeration<
      ['white', 'red', 'yellow', 'blue', 'green']
    >;
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
    background_color: Schema.Attribute.Enumeration<
      ['white', 'red', 'yellow', 'blue', 'green']
    >;
    geko_services: Schema.Attribute.Relation<
      'oneToMany',
      'api::geko-service.geko-service'
    >;
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface GekoPageBlocksSupporters extends Struct.ComponentSchema {
  collectionName: 'components_geko_page_blocks_supporters';
  info: {
    displayName: 'Supporters';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['white', 'red', 'yellow', 'blue', 'green']
    >;
    supporters: Schema.Attribute.Component<
      'geko-page-blocks.funding-project',
      true
    >;
  };
}

export interface GekoPageBlocksWelcome extends Struct.ComponentSchema {
  collectionName: 'components_geko_page_blocks_welcomes';
  info: {
    description: '';
    displayName: 'Welcome';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['white', 'red', 'yellow', 'blue', 'green']
    >;
    content: Schema.Attribute.Blocks;
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
      'alpra-page-blocks.praxistag': AlpraPageBlocksPraxistag;
      'alpra-page-blocks.slot': AlpraPageBlocksSlot;
      'alpra-page-blocks.sprechstundenart': AlpraPageBlocksSprechstundenart;
      'geko-page-blocks.about': GekoPageBlocksAbout;
      'geko-page-blocks.calendar': GekoPageBlocksCalendar;
      'geko-page-blocks.contact': GekoPageBlocksContact;
      'geko-page-blocks.cta': GekoPageBlocksCta;
      'geko-page-blocks.footer': GekoPageBlocksFooter;
      'geko-page-blocks.funding-project': GekoPageBlocksFundingProject;
      'geko-page-blocks.jobs': GekoPageBlocksJobs;
      'geko-page-blocks.neighbours': GekoPageBlocksNeighbours;
      'geko-page-blocks.news': GekoPageBlocksNews;
      'geko-page-blocks.services': GekoPageBlocksServices;
      'geko-page-blocks.supporters': GekoPageBlocksSupporters;
      'geko-page-blocks.welcome': GekoPageBlocksWelcome;
    }
  }
}
