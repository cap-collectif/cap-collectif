// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import Card from '~ds/Card/Card';
import Skeleton from '~ds/Skeleton';
import AppBox from '~ui/Primitives/AppBox';

const DebateArticleCard = () => (
  <Card bg="white" p={0} flexDirection="column" overflow="hidden" display="flex" flex={1}>
    <AppBox width="100%" bg="gray.150" height="135px" />

    <Flex direction="column" p={4} bg="white" flex={1}>
      <Skeleton.Text height="35px" width="100%" />
      <Skeleton.Text size="sm" width="50%" my={2} />
      <Skeleton.Text size="sm" width="50%" />
    </Flex>
  </Card>
);

export default DebateArticleCard;
