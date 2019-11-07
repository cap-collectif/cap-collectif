/* @flow */
import * as React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { storiesOf } from '@storybook/react';
import { boolean, text } from 'storybook-addon-knobs';
import { injectIntl } from 'react-intl';
import { Button } from 'react-bootstrap';

import { UserAvatarDeprecated } from '../../components/User/UserAvatarDeprecated';
import Navbar from '../../components/Navbar/Navbar';
import { TabsItemContainer, TabsLink, TabsDivider } from '../../components/Ui/TabsBar/styles';
import TabsBarDropdown from '../../components/Ui/TabsBar/TabsBarDropdown';

import { items, itemWithChildren } from '../mocks/navbarItems';
import { author as userMock } from '../mocks/users';
import type { FeatureToggles } from '../../types';
import { features as defaultFeatures } from '../../redux/modules/default';

const ButtonsContainer = styled.div`
  padding: ${props => (props.vertical ? '10px 15px' : '0 15px')};
`;

const ContentRight = ({
  intl,
  user,
  features,
  vertical,
}: {
  intl: Object,
  user: Object,
  features: FeatureToggles,
  vertical?: boolean,
}) => (
  <>
    {features.search && (
      <TabsItemContainer vertical={vertical} as="div" role="search" aria-label="Rechercher">
        <TabsLink id="navbar-search" eventKey={1} href="/search">
          <i className="cap cap-magnifier" />
          <span className="visible-xs-inline ml-5">Rechercher</span>
        </TabsLink>
      </TabsItemContainer>
    )}
    {user ? (
      <TabsBarDropdown
        pullRight
        eventKey={3}
        intl={intl}
        vertical={vertical}
        id="navbar-username"
        toggleElement={
          <span>
            <UserAvatarDeprecated user={user} size={34} anchor={false} />
            <span className="ml-5">{user.username}</span>
          </span>
        }>
        {user.isAdmin ? (
          <TabsLink eventKey={3.1} href="/admin">
            <i className="cap-setting-gears-1 mr-10" aria-hidden="true" />
            Administration
          </TabsLink>
        ) : null}
        {features.profiles ? (
          <TabsLink eventKey={3.2} href={`/profile/${user.uniqueId}`}>
            <i className="cap cap-id-8 mr-10" aria-hidden="true" />
            Mon profil
          </TabsLink>
        ) : null}
        {user.isEvaluer ? (
          <TabsLink eventKey={3.3} href="/evaluations">
            <i className="cap cap-edit-write mr-10" aria-hidden="true" />
            Mes analyses
          </TabsLink>
        ) : null}
        <TabsLink eventKey={3.4} href="/profile/edit-profile">
          <i className="cap cap-setting-adjustment mr-10" aria-hidden="true" />
          Paramètres
        </TabsLink>
        <TabsDivider aria-hidden="true" />
        <TabsLink key={3.6} eventKey={3.6} id="logout-button" onClick={() => {}}>
          <i className="cap cap-power-1 mr-10" aria-hidden="true" />
          Déconnexion
        </TabsLink>
      </TabsBarDropdown>
    ) : (
      <ButtonsContainer vertical={vertical}>
        <Button
          onClick={() => {}}
          aria-label="Ouvrir la modale d'inscription"
          className="btn--registration navbar-btn">
          Inscription
        </Button>{' '}
        <Button
          onClick={() => {}}
          aria-label="Ouvrir la modale d'inscription"
          className="btn--connection navbar-btn btn-darkest-gray">
          Connexion
        </Button>
      </ButtonsContainer>
    )}
  </>
);

const ContentRightWithIntl = injectIntl(ContentRight);

storiesOf('Layout|MainNavbar', module)
  .add('with 2 items', () => {
    const siteName = text('site name', 'Cap-Collectif');
    const logo = text(
      'logo url',
      'https://cap-collectif.com/uploads/2016/03/logo-complet-site.png',
    );
    const theme = {
      mainNavbarBg: text('Navbar background', '#ffffff', 'Theme'),
      mainNavbarBgActive: text('Navbar active item background', '#00ACC1', 'Theme'),
      mainNavbarText: text('Navbar item color', '#000000', 'Theme'),
      mainNavbarTextHover: text('Navbar item hover color', '#ffffff', 'Theme'),
      mainNavbarTextActive: text('Navbar item active color', '#ffffff', 'Theme'),
    };

    return (
      <ThemeProvider theme={theme}>
        <Navbar logo={logo} items={[items[0], items[1]]} siteName={siteName} />
      </ThemeProvider>
    );
  })
  .add('with many items', () => {
    const siteName = text('site name', 'Cap-Collectif');
    const logo = text(
      'logo url',
      'https://cap-collectif.com/uploads/2016/03/logo-complet-site.png',
    );
    const theme = {
      mainNavbarBg: text('Navbar background', '#ffffff', 'Theme'),
      mainNavbarBgActive: text('Navbar active item background', '#00ACC1', 'Theme'),
      mainNavbarText: text('Navbar item color', '#000000', 'Theme'),
      mainNavbarTextHover: text('Navbar item hover color', '#ffffff', 'Theme'),
      mainNavbarTextActive: text('Navbar item active color', '#ffffff', 'Theme'),
    };

    return (
      <ThemeProvider theme={theme}>
        <Navbar logo={logo} items={items} siteName={siteName} />
      </ThemeProvider>
    );
  })
  .add('with a submenu', () => {
    const siteName = text('site name', 'Cap-Collectif');
    const logo = text(
      'logo url',
      'https://cap-collectif.com/uploads/2016/03/logo-complet-site.png',
    );
    const theme = {
      mainNavbarBg: text('Navbar background', '#ffffff', 'Theme'),
      mainNavbarBgActive: text('Navbar active item background', '#00ACC1', 'Theme'),
      mainNavbarText: text('Navbar item color', '#000000', 'Theme'),
      mainNavbarTextHover: text('Navbar item hover color', '#ffffff', 'Theme'),
      mainNavbarTextActive: text('Navbar item active color', '#ffffff', 'Theme'),
    };

    const newItems = items.slice(0);
    newItems.splice(5, 0, itemWithChildren);

    return (
      <ThemeProvider theme={theme}>
        <Navbar logo={logo} items={newItems} siteName={siteName} />
      </ThemeProvider>
    );
  })
  .add('not logged', () => {
    const withSearch = boolean('with search', true);
    const siteName = text('site name', 'Cap-Collectif');
    const logo = text(
      'logo url',
      'https://cap-collectif.com/uploads/2016/03/logo-complet-site.png',
    );
    const theme = {
      mainNavbarBg: text('Navbar background', '#ffffff', 'Theme'),
      mainNavbarBgActive: text('Navbar active item background', '#00ACC1', 'Theme'),
      mainNavbarText: text('Navbar item color', '#000000', 'Theme'),
      mainNavbarTextHover: text('Navbar item hover color', '#ffffff', 'Theme'),
      mainNavbarTextActive: text('Navbar item active color', '#ffffff', 'Theme'),
    };

    const contentRight = (
      <ContentRightWithIntl user={null} features={{ ...defaultFeatures, search: withSearch }} />
    );

    return (
      <ThemeProvider theme={theme}>
        <Navbar logo={logo} items={items} siteName={siteName} contentRight={contentRight} />
      </ThemeProvider>
    );
  })
  .add('logged', () => {
    const withSearch = boolean('with search', true, 'Config');
    const siteName = text('site name', 'Cap-Collectif', 'Config');
    const logo = text(
      'logo url',
      'https://cap-collectif.com/uploads/2016/03/logo-complet-site.png',
      'Config',
    );
    const theme = {
      mainNavbarBg: text('Navbar background', '#ffffff', 'Theme'),
      mainNavbarBgActive: text('Navbar active item background', '#00ACC1', 'Theme'),
      mainNavbarText: text('Navbar item color', '#000000', 'Theme'),
      mainNavbarTextHover: text('Navbar item hover color', '#ffffff', 'Theme'),
      mainNavbarTextActive: text('Navbar item active color', '#ffffff', 'Theme'),
    };

    const contentRight = (
      <ContentRightWithIntl
        user={userMock}
        features={{ ...defaultFeatures, search: withSearch, profiles: true }}
      />
    );

    return (
      <ThemeProvider theme={theme}>
        <Navbar logo={logo} items={items} siteName={siteName} contentRight={contentRight} />
      </ThemeProvider>
    );
  })
  .add('with custom theme', () => {
    const withSearch = boolean('with search', true, 'Config');
    const siteName = text('site name', 'Cap-Collectif', 'Config');
    const logo = text(
      'logo url',
      'https://dialoguecitoyen.metropole.nantes.fr/media/cache/default_logo/default/0001/01/6c22377e08184457559a5f0b385556a0380c6297.png',
      'Config',
    );
    const theme = {
      mainNavbarBg: text('Navbar background', '#2293c7', 'Theme'),
      mainNavbarBgActive: text('Navbar active item background', '#ffffff', 'Theme'),
      mainNavbarText: text('Navbar item color', '#ffffff', 'Theme'),
      mainNavbarTextHover: text('Navbar item hover color', '#2293c7', 'Theme'),
      mainNavbarTextActive: text('Navbar item active color', '#2293c7', 'Theme'),
      mainNavbarBgMenu: text('Navbar menu background', '#2293c7', 'Theme'),
    };

    const contentRight = (
      <ContentRightWithIntl
        user={userMock}
        features={{ ...defaultFeatures, search: withSearch, profiles: true }}
      />
    );

    return (
      <ThemeProvider theme={theme}>
        <Navbar logo={logo} items={items} siteName={siteName} contentRight={contentRight} />
      </ThemeProvider>
    );
  });
