// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import Skeleton from '~ds/Skeleton';

const VotePlaceholder = () => (
  <Flex direction="row" align="center" justify="space-between" p={2}>
    <Flex direction="column" spacing={1} flex={1}>
      <Skeleton.Text size="lg" width="10%" />
      <Skeleton.Text size="sm" width="30%" />
    </Flex>

    <Skeleton.Text size="lg" width={10} />
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
