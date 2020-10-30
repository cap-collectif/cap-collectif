// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Heading from '~ui/Primitives/Heading';
import { FontSize } from '~ui/Primitives/constants';

storiesOf('Core|Primitives/Heading', module).add('default', () => {
  return (
    <div>
      <Heading as="h1" m={0} fontSize={FontSize.Xl6}>
        Salut
      </Heading>
      <Heading as="h2" m={0} fontSize={FontSize.Xl5}>
        Salut
      </Heading>
      <Heading as="h3" m={0} fontSize={FontSize.Xl4}>
        Salut
      </Heading>
      <Heading as="h4" m={0} fontSize={FontSize.Xl3}>
        Salut
      </Heading>
      <Heading as="h5" m={0} fontSize={FontSize.Xl2}>
        Salut
      </Heading>
      <Heading as="h6" m={0} fontSize={FontSize.Xl}>
        Salut
      </Heading>
    </div>
  );
});
