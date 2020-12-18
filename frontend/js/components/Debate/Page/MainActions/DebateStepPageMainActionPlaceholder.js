// @flow
import * as React from 'react';
import { RectShape } from 'react-placeholder/lib/placeholders';
import Flex from '~ui/Primitives/Layout/Flex';

export const DebateStepPageMainActionsPlaceholder = () => (
  <Flex direction="column" alignItems="center" spacing={4}>
    <RectShape color="#EEEEEE" style={{ width: '20%', height: 32 }} />
    <RectShape color="#EEEEEE" style={{ width: '100%', height: 48 }} />
    <Flex direction="row" alignItems="center" spacing={6} justifyContent="center" width="100%">
      <RectShape color="#EEEEEE" style={{ width: '20%', height: 48 }} />
      <RectShape color="#EEEEEE" style={{ width: '20%', height: 48 }} />
    </Flex>
  </Flex>
);

export default DebateStepPageMainActionsPlaceholder;
