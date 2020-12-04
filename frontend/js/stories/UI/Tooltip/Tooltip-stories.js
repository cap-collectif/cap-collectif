// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from 'storybook-addon-knobs';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import Tooltip from '~ds/Tooltip/Tooltip';
import Card from '~ds/Card/Card';
import Button from '~ds/Button/Button';
import AppBox from '~ui/Primitives/AppBox';

const placement = () =>
  select(
    'Placement',
    {
      'auto-start': 'auto-start',
      auto: 'auto',
      'auto-end': 'auto-end',
      'top-start': 'top-start',
      top: 'top',
      'top-end': 'top-end',
      'right-start': 'right-start',
      right: 'right',
      'right-end': 'right-end',
      'bottom-end': 'bottom-end',
      bottom: 'bottom',
      'bottom-start': 'bottom-start',
      'left-end': 'left-end',
      left: 'left',
      'left-start': 'left-start',
    },
    'top',
  );

storiesOf('Design system|Tooltip', module)
  .add('default', () => {
    return (
      <Flex align="center" gridGap={2}>
        <Tooltip label="Salut les filles">
          <Button variant="primary">Hover moi</Button>
        </Tooltip>
      </Flex>
    );
  })
  .add('with HTML content', () => {
    return (
      <Flex align="center" gridGap={2}>
        <Tooltip
          label={
            <Text textAlign="center" lineHeight="s" fontSize={1}>
              Salut{' '}
              <AppBox as="span" fontWeight="bold" color="blue.300">
                les filles
              </AppBox>
            </Text>
          }>
          <Button variant="primary">Hover moi</Button>
        </Tooltip>
      </Flex>
    );
  })
  .add('with customization', () => {
    return (
      <Flex align="center" gridGap={2}>
        <Tooltip p={2} bg="red.700" label="Salut les filles">
          <Button variant="primary">Hover moi</Button>
        </Tooltip>
      </Flex>
    );
  })
  .add('with custom trigger', () => {
    return (
      <Flex align="center" gridGap={2}>
        <Tooltip label="Salut les filles" trigger={['click']}>
          <Button variant="primary">On click</Button>
        </Tooltip>
      </Flex>
    );
  })
  .add('without arrow', () => {
    return (
      <Flex align="center" gridGap={2}>
        <Tooltip useArrow={false} label="Salut les filles">
          <Button variant="primary">Hover moi</Button>
        </Tooltip>
      </Flex>
    );
  })
  .add('with placement', () => {
    return (
      <Flex align="center" gridGap={2}>
        <Tooltip placement={placement()} label="Salut les filles">
          <Flex as={Card} minHeight="100px" justify="center" align="center">
            <Text>Hover moi</Text>
          </Flex>
        </Tooltip>
        <Tooltip placement={placement()} label="Salut les filles">
          <Flex as={Card} minHeight="200px" justify="center" align="center">
            <Text>Hover moi</Text>
          </Flex>
        </Tooltip>
        <Tooltip placement={placement()} label="Salut les filles">
          <Flex as={Card} minHeight="250px" justify="center" align="center">
            <Text>Hover moi</Text>
          </Flex>
        </Tooltip>
        <Tooltip placement={placement()} label="Salut les filles">
          <Flex as={Card} minHeight="400px" justify="center" align="center">
            <Text>Hover moi</Text>
          </Flex>
        </Tooltip>
      </Flex>
    );
  })
  .add('disabled', () => {
    return (
      <Flex align="center" gridGap={2}>
        <Tooltip isDisabled label="Salut les filles">
          <Button variant="primary">Hover moi</Button>
        </Tooltip>
      </Flex>
    );
  })
  .add('with options', () => {
    return (
      <Flex align="center" gridGap={2} wrap="wrap">
        <Tooltip label="Salut les filles" delay={0}>
          <Button variant="primary">No delay</Button>
        </Tooltip>
        <Tooltip label="Salut les filles" delay={[500, null]}>
          <Button variant="primary">500ms delay on open</Button>
        </Tooltip>
        <Tooltip label="Salut les filles" delay={[null, 500]}>
          <Button variant="primary">500ms delay on close</Button>
        </Tooltip>
        <Tooltip label="Salut les filles" keepOnHover>
          <Button variant="primary">Keep on hover</Button>
        </Tooltip>
        <Tooltip label="Salut les filles" showOnCreate>
          <Button variant="primary">Show on create</Button>
        </Tooltip>
      </Flex>
    );
  });
