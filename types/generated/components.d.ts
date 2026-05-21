import type { Schema, Struct } from '@strapi/strapi';

export interface AlpraPageBlocksAbout extends Struct.ComponentSchema {
  collectionName: 'components_alpra_page_blocks_abouts';
  info: {
    displayName: 'About';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['yellow', 'white', 'purple', 'green', 'red']
    >;
    content: Schema.Attribute.Blocks;
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface AlpraPageBlocksAnnouncements extends Struct.ComponentSchema {
  collectionName: 'components_alpra_page_blocks_announcements';
  info: {
    displayName: 'Announcements';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['yellow', 'white', 'purple', 'green', 'red']
    >;
    title: Schema.Attribute.String;
  };
}

export interface AlpraPageBlocksContact extends Struct.ComponentSchema {
  collectionName: 'components_alpra_page_blocks_contacts';
  info: {
    displayName: 'Contact';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['yellow', 'white', 'purple', 'green', 'red']
    >;
    content: Schema.Attribute.Blocks;
    images: Schema.Attribute.Media<'images' | 'files', true>;
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface AlpraPageBlocksFooter extends Struct.ComponentSchema {
  collectionName: 'components_alpra_page_blocks_footers';
  info: {
    displayName: 'Footer';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['yellow', 'white', 'purple', 'green', 'red']
    >;
  };
}

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

export interface AlpraPageBlocksServices extends Struct.ComponentSchema {
  collectionName: 'components_alpra_page_blocks_services';
  info: {
    displayName: 'Services';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['yellow', 'white', 'purple', 'green', 'red']
    >;
    content: Schema.Attribute.Blocks;
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
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

export interface AlpraPageBlocksSprechstunden extends Struct.ComponentSchema {
  collectionName: 'components_alpra_page_blocks_sprechstundens';
  info: {
    displayName: 'Sprechstunden';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['yellow', 'white', 'purple', 'green', 'red']
    >;
    navbar_link: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    sprechstunden: Schema.Attribute.Component<
      'alpra-page-blocks.sprechstundenart',
      true
    >;
    title: Schema.Attribute.String;
  };
}

export interface AlpraPageBlocksSprechstundenart
  extends Struct.ComponentSchema {
  collectionName: 'components_alpra_page_blocks_sprechstundenarts';
  info: {
    displayName: 'Sprechstunde';
  };
  attributes: {
    days: Schema.Attribute.Component<'alpra-page-blocks.praxistag', true>;
    description: Schema.Attribute.Blocks;
    type: Schema.Attribute.String;
  };
}

export interface AlpraPageBlocksWelcome extends Struct.ComponentSchema {
  collectionName: 'components_alpra_page_blocks_welcomes';
  info: {
    displayName: 'Welcome';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['yellow', 'white', 'purple', 'green', 'red']
    >;
    content: Schema.Attribute.Blocks;
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface GekoPageBlocksAbout extends Struct.ComponentSchema {
  collectionName: 'components_geko_page_blocks_abouts';
  info: {
    description: '';
    displayName: 'About';
  };
  attributes: {
    content: Schema.Attribute.Blocks;
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
    content: Schema.Attribute.Blocks;
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

export interface GekoPageBlocksNews extends Struct.ComponentSchema {
  collectionName: 'components_geko_page_blocks_news';
  info: {
    description: '';
    displayName: 'Announcements';
  };
  attributes: {
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
    content: Schema.Attribute.Blocks;
    title: Schema.Attribute.String;
  };
}

export interface KipraPageBlocksAbout extends Struct.ComponentSchema {
  collectionName: 'components_kipra_page_blocks_abouts';
  info: {
    displayName: 'About';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['yellow', 'white', 'purple', 'green']
    >;
    content: Schema.Attribute.Blocks;
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface KipraPageBlocksAnnouncements extends Struct.ComponentSchema {
  collectionName: 'components_kipra_page_blocks_announcements';
  info: {
    displayName: 'Announcements';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['yellow', 'white', 'purple', 'green']
    >;
    title: Schema.Attribute.String;
  };
}

export interface KipraPageBlocksContact extends Struct.ComponentSchema {
  collectionName: 'components_kipra_page_blocks_contacts';
  info: {
    displayName: 'Contact';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['yellow', 'white', 'purple', 'green']
    >;
    content: Schema.Attribute.Blocks;
    images: Schema.Attribute.Media<'images' | 'files', true>;
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface KipraPageBlocksFooter extends Struct.ComponentSchema {
  collectionName: 'components_kipra_page_blocks_footers';
  info: {
    displayName: 'Footer';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['yellow', 'white', 'purple', 'green']
    >;
  };
}

export interface KipraPageBlocksPraxistag extends Struct.ComponentSchema {
  collectionName: 'components_kipra_page_blocks_praxistags';
  info: {
    displayName: 'Sprechtag';
  };
  attributes: {
    day: Schema.Attribute.String;
    sprechzeiten: Schema.Attribute.Component<'kipra-page-blocks.slot', true>;
  };
}

export interface KipraPageBlocksServices extends Struct.ComponentSchema {
  collectionName: 'components_kipra_page_blocks_services';
  info: {
    displayName: 'Services';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['yellow', 'white', 'purple', 'green']
    >;
    content: Schema.Attribute.Blocks;
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface KipraPageBlocksSlot extends Struct.ComponentSchema {
  collectionName: 'components_kipra_page_blocks_slots';
  info: {
    displayName: 'Sprechzeit';
  };
  attributes: {
    annotation: Schema.Attribute.String;
    description: Schema.Attribute.String;
    doctors: Schema.Attribute.Relation<
      'oneToMany',
      'api::kipra-personnel.kipra-personnel'
    >;
    end: Schema.Attribute.String;
    start: Schema.Attribute.String;
  };
}

export interface KipraPageBlocksSprechstunden extends Struct.ComponentSchema {
  collectionName: 'components_kipra_page_blocks_sprechstundens';
  info: {
    displayName: 'Sprechstunden';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['yellow', 'white', 'purple', 'green']
    >;
    navbar_link: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    navbar_link_title: Schema.Attribute.String;
    sprechstunden: Schema.Attribute.Component<
      'kipra-page-blocks.sprechstundenart',
      true
    >;
    title: Schema.Attribute.String;
  };
}

export interface KipraPageBlocksSprechstundenart
  extends Struct.ComponentSchema {
  collectionName: 'components_kipra_page_blocks_sprechstundenarts';
  info: {
    displayName: 'Sprechstunde';
  };
  attributes: {
    days: Schema.Attribute.Component<'kipra-page-blocks.praxistag', true>;
    description: Schema.Attribute.Blocks;
    type: Schema.Attribute.String;
  };
}

export interface KipraPageBlocksTermine extends Struct.ComponentSchema {
  collectionName: 'components_kipra_page_blocks_termines';
  info: {
    displayName: 'Termine';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['yellow', 'white', 'purple', 'green']
    > &
      Schema.Attribute.DefaultTo<'white'>;
    content: Schema.Attribute.Blocks;
    navbar_link: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    navbar_link_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface KipraPageBlocksWelcome extends Struct.ComponentSchema {
  collectionName: 'components_kipra_page_blocks_welcomes';
  info: {
    displayName: 'Welcome';
  };
  attributes: {
    background_color: Schema.Attribute.Enumeration<
      ['yellow', 'white', 'purple', 'green']
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
      'alpra-page-blocks.about': AlpraPageBlocksAbout;
      'alpra-page-blocks.announcements': AlpraPageBlocksAnnouncements;
      'alpra-page-blocks.contact': AlpraPageBlocksContact;
      'alpra-page-blocks.footer': AlpraPageBlocksFooter;
      'alpra-page-blocks.praxistag': AlpraPageBlocksPraxistag;
      'alpra-page-blocks.services': AlpraPageBlocksServices;
      'alpra-page-blocks.slot': AlpraPageBlocksSlot;
      'alpra-page-blocks.sprechstunden': AlpraPageBlocksSprechstunden;
      'alpra-page-blocks.sprechstundenart': AlpraPageBlocksSprechstundenart;
      'alpra-page-blocks.welcome': AlpraPageBlocksWelcome;
      'geko-page-blocks.about': GekoPageBlocksAbout;
      'geko-page-blocks.calendar': GekoPageBlocksCalendar;
      'geko-page-blocks.contact': GekoPageBlocksContact;
      'geko-page-blocks.cta': GekoPageBlocksCta;
      'geko-page-blocks.news': GekoPageBlocksNews;
      'geko-page-blocks.services': GekoPageBlocksServices;
      'geko-page-blocks.welcome': GekoPageBlocksWelcome;
      'kipra-page-blocks.about': KipraPageBlocksAbout;
      'kipra-page-blocks.announcements': KipraPageBlocksAnnouncements;
      'kipra-page-blocks.contact': KipraPageBlocksContact;
      'kipra-page-blocks.footer': KipraPageBlocksFooter;
      'kipra-page-blocks.praxistag': KipraPageBlocksPraxistag;
      'kipra-page-blocks.services': KipraPageBlocksServices;
      'kipra-page-blocks.slot': KipraPageBlocksSlot;
      'kipra-page-blocks.sprechstunden': KipraPageBlocksSprechstunden;
      'kipra-page-blocks.sprechstundenart': KipraPageBlocksSprechstundenart;
      'kipra-page-blocks.termine': KipraPageBlocksTermine;
      'kipra-page-blocks.welcome': KipraPageBlocksWelcome;
    }
  }
}
