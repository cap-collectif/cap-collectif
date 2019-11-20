// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean, select } from 'storybook-addon-knobs';
import { Button } from 'react-bootstrap';

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

storiesOf('Core|Buttons/Button', module).add('default', () => {
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
});
