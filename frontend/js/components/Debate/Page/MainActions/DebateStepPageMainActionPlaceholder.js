// @flow
import * as React from 'react';
import { Flex, Skeleton } from '@cap-collectif/ui';

export const DebateStepPageMainActionsPlaceholder = (): React.Node => (
  <Flex direction="column" alignItems="center" spacing={4}>
    <Skeleton.Text width="20%" height="32px" />
    <Skeleton.Text width="100%" height="48px" />

    <Flex direction="row" alignItems="center" spacing={6} justifyContent="center" width="100%">
      <Skeleton.Text width="20%" height="48px" />
      <Skeleton.Text width="20%" height="48px" />
    </Flex>
  </Flex>
);

export default DebateStepPageMainActionsPlaceholder;
