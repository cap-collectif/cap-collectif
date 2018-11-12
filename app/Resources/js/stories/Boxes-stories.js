// @flow
import * as React from 'react';
import { boolean, text, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import PrivateBox from '../components/Ui/PrivateBox';

storiesOf('Boxes', module)
  .addDecorator(withKnobs)
  .add(
    'Private box',
    () => {
      const message = text('Message', 'my-translation-key');
      const content = text('Content', 'My content');
      const show = boolean('Show', true);

      return (
        <PrivateBox show={show} message={message}>
          <div>{content}</div>
        </PrivateBox>
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
