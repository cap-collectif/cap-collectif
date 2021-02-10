// @flow
import * as React from 'react';
import { graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { useFragment } from 'relay-hooks';
import type { Props as DetailDrawerProps } from '~ds/DetailDrawer/DetailDrawer';
import DetailDrawer from '~ds/DetailDrawer/DetailDrawer';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import Tag from '~ds/Tag/Tag';
import Heading from '~ui/Primitives/Heading';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';
import type {
  DebateStepPageOpinionDrawer_opinion,
  DebateStepPageOpinionDrawer_opinion$key,
} from '~relay/DebateStepPageOpinionDrawer_opinion.graphql';
import NewUserAvatar from '~/components/User/NewUserAvatar';
import Icon, { ICON_SIZE } from '~ds/Icon/Icon';

const FRAGMENT = graphql`
  fragment DebateStepPageOpinionDrawer_opinion on DebateOpinion {
    title
    body
    author {
      ...NewUserAvatar_user
      username
      biography
    }
    type
  }
`;

const DebateStepPageOpinionDrawer = ({
  opinion: opinionFragment,
  ...drawerProps
}: {|
  ...DetailDrawerProps,
  opinion: DebateStepPageOpinionDrawer_opinion$key,
|}) => {
  const opinion: DebateStepPageOpinionDrawer_opinion = useFragment(FRAGMENT, opinionFragment);

  return (
    <DetailDrawer {...drawerProps}>
      <DetailDrawer.Body position="relative">
        <Icon
          onClick={drawerProps.onClose}
          css={{ '&:hover': { cursor: 'pointer' } }}
          color="blue.500"
          size={ICON_SIZE.LG}
          className="detail__drawer--back-arow"
          position="absolute"
          top={6}
          left={6}
          name="LONG_ARROW_LEFT"
        />
        <Flex direction="column" mt={6} align="center">
          <NewUserAvatar
            user={opinion.author}
            size="xl"
            border="3px solid"
            borderColor="yellow.500"
          />
          <Text mt={2} fontSize={4} fontWeight="600">
            {opinion.author.username}
          </Text>
          <Tag mt={1} variant={opinion.type === 'FOR' ? 'green' : 'red'}>
            <Heading as="h5" fontWeight="700" uppercase>
              <FormattedMessage id={opinion.type === 'FOR' ? 'opinion.for' : 'opinion.against'} />
            </Heading>
          </Tag>
          <Text mt={2} color="neutral-gray.700" fontSize={3}>
            {opinion.author.biography}
          </Text>
        </Flex>
        <Flex direction="column" mt={6} spacing={4}>
          <Heading as="h4" fontWeight="600">
            {opinion.title}
          </Heading>
          <WYSIWYGRender value={opinion.body} />
        </Flex>
      </DetailDrawer.Body>
    </DetailDrawer>
  );
};

export default DebateStepPageOpinionDrawer;
