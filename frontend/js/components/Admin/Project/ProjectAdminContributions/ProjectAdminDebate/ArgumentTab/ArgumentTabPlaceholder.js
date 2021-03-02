// @flow
import * as React from 'react';
import { RectShape } from 'react-placeholder/lib/placeholders';
import Flex from '~ui/Primitives/Layout/Flex';
import AppBox from '~ui/Primitives/AppBox';

const ArgumentPlaceholder = () => (
  <Flex
    direction="row"
    spacing="100px"
    align="center"
    p={2}
    borderTop="normal"
    borderColor="gray.150">
    <Flex direction="column" spacing={1} flex={1}>
      <AppBox
        as={RectShape}
        bg="gray.150"
        borderRadius="placeholder"
        style={{ width: '100%', height: '24px', marginRight: 0 }}
      />
      <AppBox
        as={RectShape}
        bg="gray.150"
        borderRadius="placeholder"
        style={{ width: '50%', height: '16px', marginRight: 0 }}
      />
    </Flex>

    <Flex direction="row" flex={1} justify="center">
      <AppBox
        as={RectShape}
        bg="gray.150"
        borderRadius="placeholder"
        style={{ width: '48px', height: '24px', marginRight: 0 }}
      />
    </Flex>
  </Flex>
);

const ArgumentTabPlaceholder = () => (
  <Flex direction="column">
    <ArgumentPlaceholder />
    <ArgumentPlaceholder />
    <ArgumentPlaceholder />
    <ArgumentPlaceholder />
    <ArgumentPlaceholder />
  </Flex>
);

export default ArgumentTabPlaceholder;
