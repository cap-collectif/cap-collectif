// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import Skeleton from '~ds/Skeleton';

const DashboardFiltersPlaceholder = (): React.Node => (
  <Flex direction="row" align="center" spacing={2}>
    <Skeleton.Text width="200px" size="lg" bg="white" />
    <Skeleton.Text width="215px" size="lg" bg="white" />
    <Skeleton.Text width="215px" size="lg" bg="white" />
  </Flex>
);

export default DashboardFiltersPlaceholder;
