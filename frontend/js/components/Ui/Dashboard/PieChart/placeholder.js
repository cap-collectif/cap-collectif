// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import Skeleton from '~ds/Skeleton';

const PieChartPlaceholder = () => (
  <Flex direction="row" justify="space-between">
    <Flex direction="column" spacing={3}>
      <Skeleton.Text size="md" width="225px" />
      <Skeleton.Text size="md" width="225px" />
      <Skeleton.Text size="md" width="225px" />
      <Skeleton.Text size="md" width="225px" />
      <Skeleton.Text size="md" width="225px" />
    </Flex>

    <Skeleton.Circle size="130px" />
  </Flex>
);

export default PieChartPlaceholder;
