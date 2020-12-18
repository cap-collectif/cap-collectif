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
      <DetailDrawer.Header textAlign="center" justifyContent="space-between">
        <Tag ml="auto" variant={opinion.type === 'FOR' ? 'green' : 'red'}>
          <Heading as="h5" fontWeight="700" uppercase>
            <FormattedMessage id={opinion.type === 'FOR' ? 'opinion.for' : 'opinion.against'} />
          </Heading>
        </Tag>
      </DetailDrawer.Header>
      <DetailDrawer.Body>
        <Flex direction="column">
          <Flex direction="row" spacing={6} mb={5} alignItems="center">
            <NewUserAvatar user={opinion.author} size="xl" borderColor="yellow.500" border="3px" />
            <Flex direction="column">
              <Text fontSize={4} fontWeight="600">
                {opinion.author.username}
              </Text>
              <Text color="neutral-gray.700" fontSize={3}>
                {opinion.author.biography}
              </Text>
            </Flex>
          </Flex>
          <Flex direction="column" spacing={4}>
            <Heading as="h4" fontWeight="600">
              {opinion.title}
            </Heading>
            <WYSIWYGRender value={opinion.body} />
          </Flex>
        </Flex>
      </DetailDrawer.Body>
    </DetailDrawer>
  );
};

export default DebateStepPageOpinionDrawer;
