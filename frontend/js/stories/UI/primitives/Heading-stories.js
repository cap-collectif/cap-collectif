// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Heading from '~ui/Primitives/Heading';

storiesOf('Design system|Primitives/Heading', module).add('default', () => {
  return (
    <div>
      <Heading as="h1">Salut</Heading>
      <Heading as="h2">Salut</Heading>
      <Heading as="h3">Salut</Heading>
      <Heading as="h4">Salut</Heading>
      <Heading as="h5">Salut</Heading>
      <Heading as="h6">Salut</Heading>
    </div>
  );
});
