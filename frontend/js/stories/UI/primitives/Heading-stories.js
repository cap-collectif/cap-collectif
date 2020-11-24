// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Heading from '~ui/Primitives/Heading';

storiesOf('Design system|Primitives/Heading', module).add('default', () => {
  return (
    <div>
      <Heading as="h1" m={0}>
        Salut
      </Heading>
      <Heading as="h2" m={0}>
        Salut
      </Heading>
      <Heading as="h3" m={0}>
        Salut
      </Heading>
      <Heading as="h4" m={0}>
        Salut
      </Heading>
      <Heading as="h5" m={0}>
        Salut
      </Heading>
      <Heading as="h6" m={0}>
        Salut
      </Heading>
    </div>
  );
});
