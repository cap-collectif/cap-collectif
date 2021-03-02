// @flow
import * as React from 'react';
import { RectShape } from 'react-placeholder/lib/placeholders';
import Flex from '~ui/Primitives/Layout/Flex';
import AppBox from '~ui/Primitives/AppBox';

const VotePlaceholder = () => (
  <Flex direction="row" align="center" justify="space-between" p={2}>
    <Flex direction="column" spacing={1} flex={1}>
      <AppBox
        as={RectShape}
        bg="gray.150"
        borderRadius="placeholder"
        style={{ width: '10%', height: '24px', marginRight: 0 }}
      />
      <AppBox
        as={RectShape}
        bg="gray.150"
        borderRadius="placeholder"
        style={{ width: '30%', height: '16px', marginRight: 0 }}
      />
    </Flex>

    <AppBox
      as={RectShape}
      bg="gray.150"
      borderRadius="placeholder"
      style={{ width: '48px', height: '24px', marginRight: 0 }}
    />
  </Flex>
);

const VoteTabPlaceholder = () => (
  <Flex direction="row">
    <Flex direction="column" flex={1} borderRight="1px solid" borderColor="gray.200">
      <VotePlaceholder />
      <VotePlaceholder />
      <VotePlaceholder />
      <VotePlaceholder />
    </Flex>

    <Flex direction="column" flex={1}>
      <VotePlaceholder />
      <VotePlaceholder />
      <VotePlaceholder />
      <VotePlaceholder />
    </Flex>
  </Flex>
);

export default VoteTabPlaceholder;
