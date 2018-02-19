// @flow
import * as React from 'react'
import { storiesOf } from '@storybook/react';
import Loader from './Loader';

storiesOf('Loader', module)
  .add('Default', () => {
    return <Loader />
  })
