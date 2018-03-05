// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Font } from './Font';

storiesOf('Style', module)
  .add('Fonts', () => {
    return (
      <div className="container storybook-container">
        <Font />
      </div>
    );
  })

