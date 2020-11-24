// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { select, number } from 'storybook-addon-knobs';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';

const getDirection = () =>
  select(
    'Direction',
    {
      Row: 'row',
      Column: 'column',
    },
    'row',
  );

const getSpacing = () => number('Spacing', 2);

storiesOf('Design system|Primitives/Layout/Flex', module)
  .add('default', () => {
    return (
      <Flex direction={getDirection()}>
        <Text bg="red.300" p={1}>
          Genshin
        </Text>
        <Text bg="red.400" p={1}>
          Impact
        </Text>
        <Text bg="red.500" p={1}>
          Fishcl le S
        </Text>
      </Flex>
    );
  })
  .add('with responsive direction', () => {
    return (
      <Flex direction={['column', 'row', 'column']} spacing={2}>
        <Text bg="red.300" p={1}>
          Genshin
        </Text>
        <Text bg="red.400" p={1}>
          Impact
        </Text>
        <Text bg="red.500" p={1}>
          Fishcl le S
        </Text>
      </Flex>
    );
  })
  .add('with spacing', () => {
    return (
      <Flex direction={getDirection()} spacing={getSpacing()}>
        <Flex direction={getDirection()} spacing={getSpacing()} bg="red.300" p={2}>
          <Flex justify="center" bg="blue.300">
            Hi
          </Flex>
          <Flex justify="center" bg="blue.600">
            how
          </Flex>
        </Flex>
        <Flex direction={getDirection()} spacing={getSpacing()} bg="yellow.300" p={2}>
          <Flex justify="center" align="center" bg="blue.300">
            are
          </Flex>
          <Flex justify="center" align="center" bg="blue.600">
            you
          </Flex>
        </Flex>
      </Flex>
    );
  });
