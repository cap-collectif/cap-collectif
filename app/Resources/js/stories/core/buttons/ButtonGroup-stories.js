// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from '@storybook/addon-knobs';
import { Button, ButtonGroup } from 'react-bootstrap';

const bsSizeOptions = {
  Large: 'large',
  Normal: null,
  Small: 'small',
  XSmall: 'xsmall',
};

storiesOf('Core|Buttons/ButtonGroup', module).add(
  'default',
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
);
