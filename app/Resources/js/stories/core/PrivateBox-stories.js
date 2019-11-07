// @flow
import * as React from 'react';
import { boolean, text } from 'storybook-addon-knobs';
import { storiesOf } from '@storybook/react';
import PrivateBox from '../../components/Ui/Boxes/PrivateBox';

storiesOf('Core|PrivateBox', module).add('default', () => {
  const message = text('Message', 'my-translation-key');
  const content = text('Content', 'My content');
  const show = boolean('Show', true);

  return (
    <PrivateBox show={show} message={message}>
      <div>{content}</div>
    </PrivateBox>
  );
});
