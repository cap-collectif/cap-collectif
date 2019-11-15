// @flow
import * as React from 'react';
import { boolean } from 'storybook-addon-knobs';
import { storiesOf } from '@storybook/react';
import { Loader } from '../../components/Ui/FeedbacksIndicators/Loader';

storiesOf('Core|Loader', module).add('default', () => {
  const show = boolean('Show', true);

  return <Loader show={show} />;
});
