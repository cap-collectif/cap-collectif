// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { setIntlConfig, withIntl } from 'storybook-addon-intl';
import { addLocaleData } from 'react-intl';
import frLocaleData from 'react-intl/locale-data/fr';
import { text, boolean, select } from '@storybook/addon-knobs';
import { Button, ButtonGroup, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';
import ShareButton from '../components/Ui/Button/ShareButton';
import ShareButtonAction from '../components/Ui/Button/ShareButtonAction';

const bsStyleOptions = {
  Warning: 'warning',
  Danger: 'danger',
  Success: 'success',
  Info: 'info',
  Primary: 'primary',
  Link: 'link',
  Null: null,
};

const bsSizeOptions = {
  Large: 'large',
  Normal: null,
  Small: 'small',
  XSmall: 'xsmall',
};

// translation configuration - not working for now
addLocaleData(frLocaleData);

const messages = {
  en: {
    'share.mail': 'Email',
    'share.facebook': 'Facebook',
    'share.twitter': 'Twitter',
    'share.linkedin': 'Linked In',
    'share.link': 'Share Link',
  },
  fr: {
    'share.mail': 'Email',
    'share.facebook': 'Facebook',
    'share.twitter': 'Twitter',
    'share.linkedin': 'Linked In',
    'share.link': 'Lien de partage',
  },
};

const getMessages = locale => messages[locale];

setIntlConfig({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  getMessages,
});

// Share Button components parametrable
const ShareButtonDropDown = ({ type }: { type: Object }) => (
  <ShareButton id="shareButton" bsSize={type.size} outline={type.outline} grey={type.grey}>
    <ShareButtonAction action="mail" />
    <ShareButtonAction action="facebook" />
    <ShareButtonAction action="twitter" />
    <ShareButtonAction action="linkedin" />
    <ShareButtonAction action="link" />
  </ShareButton>
);

storiesOf('Actions', module)
  .addDecorator(withIntl)
  .add(
    'Buttons',
    () => {
      const content = text('Content', 'My button');
      const bsStyle = select('BsStyle', bsStyleOptions, 'primary');
      const bsSize = select('BsSize', bsSizeOptions, null);
      const disabled = boolean('Disabled', false);
      const outline = boolean('Outline', false);

      return (
        <Button
          bsStyle={bsStyle}
          bsSize={bsSize}
          className={outline ? 'btn--outline' : ''}
          disabled={disabled}>
          {content}
        </Button>
      );
    },
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
      },
    },
  )
  .add(
    'Buttons group',
    () => {
      const bsSize = select('BsSize', bsSizeOptions, null);

      return (
        <ButtonGroup bsSize={bsSize}>
          <Button bsStyle="primary">Left</Button>
          <Button bsStyle="primary">Middle</Button>
          <Button bsStyle="primary">Right</Button>
        </ButtonGroup>
      );
    },
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
        propTablesExclude: [Button],
      },
    },
  )
  .add(
    'Buttons toolbar',
    () => (
      <ButtonToolbar>
        <Button bsStyle="primary">Button</Button>
        <Button bsStyle="primary">Other button</Button>
      </ButtonToolbar>
    ),
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
        propTablesExclude: [Button],
      },
    },
  )
  .add(
    'Dropdown button',
    () => {
      const bsSize = select('BsSize', bsSizeOptions, null);
      const bsStyle = select('BsStyle', bsStyleOptions, 'primary');
      const title = text('Title', 'My title');
      const active = boolean('Active props for first item', false);
      const header = boolean('Header props for first item', false);

      return (
        <DropdownButton bsStyle={bsStyle} bsSize={bsSize} title={title}>
          <MenuItem header={header} active={active}>
            Item
          </MenuItem>
          <MenuItem divider />
          <MenuItem>Other item</MenuItem>
        </DropdownButton>
      );
    },
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
      },
    },
  )
  .add(
    'Share button',
    () => {
      const type = {
        size: '',
      };

      return <ShareButtonDropDown type={type} />;
    },
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
      },
    },
  )
  .add(
    'Argument share button',
    () => {
      const type = {
        size: 'xs',
        outline: true,
        grey: true,
      };

      return <ShareButtonDropDown type={type} />;
    },
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
      },
    },
  );
