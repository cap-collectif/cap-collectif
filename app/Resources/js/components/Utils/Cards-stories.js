// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Card from './Card';

storiesOf('Cards', module)
  .add('Card', () => {
    return <Card />;
  });
