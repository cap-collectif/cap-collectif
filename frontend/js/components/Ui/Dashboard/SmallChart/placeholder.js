// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import Skeleton from '~ds/Skeleton';

const SmallChartPlaceholder = () => (
  <Flex
    direction="row"
    justify="space-around"
    px={4}
    py={6}
    spacing={8}
    bg="white"
    width="25%"
    borderRadius="normal">
    <Flex direction="column" spacing={4} flex={1}>
      <Skeleton.Text size="sm" width="100%" />
      <Skeleton.Text size="md" width="100%" />
    </Flex>

    <Skeleton.Text flex={1} height="100%" />
  </Flex>
);

export default SmallChartPlaceholder;
