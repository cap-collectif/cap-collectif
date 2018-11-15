// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Label } from 'react-bootstrap';
import { withKnobs, text, select, boolean } from '@storybook/addon-knobs';

const bsStyleOptions = {
  Warning: 'warning',
  Danger: 'danger',
  Success: 'success',
  Info: 'info',
  Primary: 'primary',
  Default: 'default',
};

storiesOf('Labels & badges', module)
  .addDecorator(withKnobs)
  .add(
    'label',
    () => {
      const bsStyle = select('BsStyle', bsStyleOptions, 'default');
      const content = text('Content', 'Content of label');
      const badgePill = boolean('Badge pill', false);

      return (
        <Label className={badgePill ? 'badge-pill' : null} bsStyle={bsStyle}>
          {content}
        </Label>
      );
    },
    {
      info: {
        text: `
          Ce composant est utilisé ...
        `,
      },
    },
  );
