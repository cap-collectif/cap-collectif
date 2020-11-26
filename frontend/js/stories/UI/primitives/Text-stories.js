// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { number } from 'storybook-addon-knobs';
import Text from '~ui/Primitives/Text';
import Grid from '~ui/Primitives/Layout/Grid';
import Flex from '~ui/Primitives/Layout/Flex';

storiesOf('Design system|Primitives/Text', module)
  .add('default', () => {
    return (
      <Grid gridGap={2} autoFit={{ min: '300px', max: '1fr' }}>
        <Text bg="red.300">I have a text, I have an Apple, hmmm, Apple Text</Text>
        <Text fontSize={4} bg="red.300" color="blue.800" p={2}>
          I have a bigger text, I have an Apple (and also a bigger padding), hmmm, Apple Text
        </Text>
      </Grid>
    );
  })
  .add('with truncate', () => {
    const truncate = number('Truncate', 42);
    return (
      <Flex>
        <Text p={2} bg="red.300" truncate={truncate}>
          Je suis tronqué tu vois que mes {truncate} premiers charactères, mais si tu me survol tu
          verras mon contenu complet
        </Text>
      </Flex>
    );
  });
