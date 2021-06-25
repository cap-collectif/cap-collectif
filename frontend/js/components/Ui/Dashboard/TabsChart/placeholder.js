// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import Skeleton from '~ds/Skeleton';

const TabsChartPlaceholder = () => (
  <Flex direction="column" justify="space-between">
    <Flex direction="row" justify="space-between" mb={9}>
      <Skeleton.Text width="20%" height="50px" />
      <Skeleton.Text width="20%" height="50px" />
      <Skeleton.Text width="20%" height="50px" />
      <Skeleton.Text width="20%" height="50px" />
    </Flex>

    <Skeleton.Text width="100%" height="265px" />
  </Flex>
);

export default TabsChartPlaceholder;
