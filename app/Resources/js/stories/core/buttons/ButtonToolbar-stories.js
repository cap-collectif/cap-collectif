// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Button, ButtonToolbar } from 'react-bootstrap';

storiesOf('Core|Buttons/ButtonToolbar', module).add(
  'default',
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
);
