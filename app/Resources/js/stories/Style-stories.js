// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { FontStyle } from './FontStyle';

storiesOf('Style', module)
  .add('Fonts', () => {
    return (
      <div className="container storybook-container">
        <FontStyle />
      </div>
    );
  })

