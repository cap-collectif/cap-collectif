/* @flow */
import * as React from 'react';
import styled from 'styled-components';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import { setIntlConfig, withIntl } from 'storybook-addon-intl';
import { addLocaleData } from 'react-intl';
import frLocaleData from 'react-intl/locale-data/fr';

import TabsBar from '../components/Ui/TabsBar/TabsBar';

import { items, itemWithChildren } from './mocks/navbarItems';

const StorybookWrapper = styled.div`
  background-color: lightBlue;
  height: ${({ height }) => height || "51px"};
`

addLocaleData(frLocaleData);

// Provide your messages
const messages = {
  en: {
    'global.navbar.see_more': 'See more',
    'navbar.homepage': 'Home',
    'navbar.skip_links.menu': 'Go to menu',
    'navbar.skip_links.content': 'Go to content',
    'active.page': 'active page',
  },
  fr: {
    'global.navbar.see_more': 'Plus',
    'navbar.homepage': 'Accueil',
    'navbar.skip_links.menu': 'Aller au menu',
    'navbar.skip_links.content': 'Aller au contenu',
    'active.page': 'page active',
  },
};

const getMessages = locale => messages[locale];

setIntlConfig({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  getMessages,
});

const newItems = items.slice(0);
newItems.splice(5, 0, itemWithChildren);

storiesOf('TabsBar', module)
  .addDecorator(withKnobs)
  .addDecorator(withIntl)
  .add('default case', () => (
    <StorybookWrapper>
      <TabsBar items={newItems} />
    </StorybookWrapper>
  ))
  .add('vertical', () => (
    <StorybookWrapper height="auto">
      <TabsBar items={newItems} vertical overflowEnable={false} />
    </StorybookWrapper>
  ));
