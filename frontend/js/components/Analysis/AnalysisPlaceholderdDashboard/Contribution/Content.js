// @flow
import * as React from 'react';
import Skeleton from '~ds/Skeleton';
import Flex from '~ui/Primitives/Layout/Flex';

const Content = () => (
  <Flex direction="row" align="center" justify="flex-end">
    <Skeleton.Text width="125px" size="sm" borderRadius="20px" mr={8} />
    <Skeleton.Text width="125px" size="sm" bg="blue.200" borderRadius="20px" />
  </Flex>
);

export default Content;
