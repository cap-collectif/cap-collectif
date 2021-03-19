// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Card from '~ds/Card/Card';
import Flex from '~ui/Primitives/Layout/Flex';
import Tag from '~ds/Tag/Tag';
import Skeleton from '~ds/Skeleton';

const FaceToFacePlaceholder = () => (
  <Flex direction="column" spacing={7}>
    <Skeleton.Text size="md" width="50%" />

    <Flex direction="row" justify="space-between" spacing={6}>
      <Card as={Flex} flexDirection="column" flex={1} position="relative" pt={10}>
        <Tag
          variant="green"
          position="absolute"
          top="-1px"
          left="-1px"
          borderBottomLeftRadius={0}
          borderTopRightRadius={0}
          interactive={false}>
          <FormattedMessage id="opinion.for" />
        </Tag>

        <Flex direction="row" spacing={4} mb={5} align="center">
          <Skeleton.Circle size={8} />
          <Skeleton.Text size="md" width="40%" />
        </Flex>

        <Skeleton.Text height="110px" />
      </Card>

      <Card as={Flex} flexDirection="column" flex={1} position="relative" pt={10}>
        <Tag
          variant="red"
          position="absolute"
          top="-1px"
          left="-1px"
          borderBottomLeftRadius={0}
          borderTopRightRadius={0}
          interactive={false}>
          <FormattedMessage id="opinion.against" />
        </Tag>

        <Flex direction="row" spacing={4} mb={5} align="center">
          <Skeleton.Circle size={8} />
          <Skeleton.Text size="md" width="40%" />
        </Flex>

        <Skeleton.Text height="110px" />
      </Card>
    </Flex>
  </Flex>
);

export default FaceToFacePlaceholder;
