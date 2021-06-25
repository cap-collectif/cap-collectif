// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import Skeleton from '~ds/Skeleton';

const ContributorPlaceholder = (): React.Node => (
  <Flex direction="column" align="center" spacing={2}>
    <Skeleton.Circle size="58px" />
    <Skeleton.Text width="100px" height="60px" />
  </Flex>
);

export default ContributorPlaceholder;
