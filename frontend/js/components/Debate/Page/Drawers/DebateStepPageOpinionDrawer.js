// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Flex, Text, Tag, Heading, Icon, CapUIIcon, CapUIIconSize } from '@cap-collectif/ui';
import DetailDrawer from '~ds/DetailDrawer/DetailDrawer';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';
import type { DebateStepPageOpinionDrawer_opinion$key } from '~relay/DebateStepPageOpinionDrawer_opinion.graphql';
import NewUserAvatar from '~/components/User/NewUserAvatar';

type Props = {|
  +isOpen: boolean,
  +onClose?: () => void,
  +opinion: DebateStepPageOpinionDrawer_opinion$key,
|};

const DebateStepPageOpinionDrawer = ({
  opinion: opinionFragment,
  ...drawerProps
}: Props): React.Node => {
  const opinion = useFragment(
    graphql`
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
    `,
    opinionFragment,
  );

  return (
    <DetailDrawer {...drawerProps}>
      <DetailDrawer.Body position="relative">
        <Icon
          onClick={drawerProps.onClose}
          sx={{ '&:hover': { cursor: 'pointer' } }}
          color="blue.500"
          size={CapUIIconSize.Lg}
          className="detail__drawer--back-arow"
          position="absolute"
          top={6}
          left={6}
          name={CapUIIcon.LongArrowLeft}
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
          <Tag mt={1} variantColor={opinion.type === 'FOR' ? 'green' : 'red'}>
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
