// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Card from './Card';
import Progress from './Progress';

storiesOf('Components', module)
  .add('Card', () => {
    return <Card />;
  })
  .add('Progress', () => {
    return <Progress />;
  });

