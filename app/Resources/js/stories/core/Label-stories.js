// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Label } from 'react-bootstrap';
import { text, select, boolean } from '@storybook/addon-knobs';

const bsStyleOptions = {
  Warning: 'warning',
  Danger: 'danger',
  Success: 'success',
  Info: 'info',
  Primary: 'primary',
  Default: 'default',
};

storiesOf('Core|Label', module).add('default', () => {
  const bsStyle = select('BsStyle', bsStyleOptions, 'default');
  const content = text('Content', 'Content of label');
  const badgePill = boolean('Badge pill', false);

  return (
    <Label className={badgePill ? 'badge-pill' : null} bsStyle={bsStyle}>
      {content}
    </Label>
  );
});
