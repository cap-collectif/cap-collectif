// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean, select } from '@storybook/addon-knobs';
import { DropdownButton, MenuItem } from 'react-bootstrap';

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

storiesOf('Core|Buttons/DropdownButton', module).add('default', () => {
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
});
