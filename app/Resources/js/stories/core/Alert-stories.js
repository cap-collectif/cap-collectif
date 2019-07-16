// @flow
import * as React from 'react';
import { boolean, select, text } from '@storybook/addon-knobs';
import { Alert } from 'react-bootstrap';
import { storiesOf } from '@storybook/react';

const bsStyleOptions = {
  Warning: 'warning',
  Danger: 'danger',
  Success: 'success',
  Info: 'info',
};

const doFunction = () => {};

storiesOf('Core|Alert', module).add('default', () => {
  const bsStyle = select('Style', bsStyleOptions, 'info');
  const content = text('Content', 'My content');
  const onDismiss = boolean('onDismiss', true);

  return (
    <Alert bsStyle={bsStyle} onDismiss={onDismiss ? doFunction : null}>
      {content}
    </Alert>
  );
});
