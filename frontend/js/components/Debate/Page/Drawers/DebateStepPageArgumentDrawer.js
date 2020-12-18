// @flow
import * as React from 'react';
import { graphql } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import moment from 'moment';
import { useFragment } from 'relay-hooks';
import type { Props as DetailDrawerProps } from '~ds/DetailDrawer/DetailDrawer';
import DetailDrawer from '~ds/DetailDrawer/DetailDrawer';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import Menu from '../../../DesignSystem/Menu/Menu';
import Button from '~ds/Button/Button';
import Tag from '~ds/Tag/Tag';
import Heading from '~ui/Primitives/Heading';
import LoginOverlay from '~/components/Utils/LoginOverlay';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import { ICON_SIZE } from '~ds/Icon/Icon';
import { voteForArgument } from '~/components/Debate/ArgumentCard/ArgumentCard';
import type {
  DebateStepPageArgumentDrawer_argument,
  DebateStepPageArgumentDrawer_argument$key,
} from '~relay/DebateStepPageArgumentDrawer_argument.graphql';

const FRAGMENT = graphql`
  fragment DebateStepPageArgumentDrawer_argument on DebateArgument
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
    id
    author {
      username
    }
    type
    body
    publishedAt
    viewerHasVote @include(if: $isAuthenticated)
    votes(first: 0) {
      totalCount
    }
  }
`;

const DebateStepPageArgumentDrawer = ({
  argument: argumentFragment,
  ...drawerProps
}: {|
  ...DetailDrawerProps,
  +argument: DebateStepPageArgumentDrawer_argument$key,
|}) => {
  const argument: DebateStepPageArgumentDrawer_argument = useFragment(FRAGMENT, argumentFragment);
  const intl = useIntl();
  return (
    <DetailDrawer {...drawerProps}>
      <DetailDrawer.Header textAlign="center" justifyContent="space-between">
        <Flex direction="column">
          <Text fontWeight="bold">{argument.author.username}</Text>
        </Flex>
        <Menu>
          <Menu.Button as={React.Fragment}>
            <Button variant="tertiary">...</Button>
          </Menu.Button>
          <Menu.List>
            <Menu.ListItem>
              <Text>WIP</Text>
            </Menu.ListItem>
          </Menu.List>
        </Menu>
      </DetailDrawer.Header>
      <DetailDrawer.Body>
        <Flex direction="column" spacing={3}>
          <Flex>
            <Tag variant={argument.type === 'FOR' ? 'green' : 'red'}>
              <Heading as="h5" fontWeight="700" uppercase>
                <FormattedMessage id={argument.type === 'FOR' ? 'global.for' : 'global.against'} />
              </Heading>
            </Tag>
            <Text ml="auto" color="neutral-gray.500">
              {moment(argument.publishedAt)
                .startOf('day')
                .fromNow()}
            </Text>
          </Flex>
          <Text>{argument.body}</Text>
          <Flex align="center" justify="center">
            <LoginOverlay>
              <ButtonQuickAction
                onClick={() => voteForArgument(argument.id, argument.viewerHasVote, intl)}
                mr={1}
                size={ICON_SIZE.LG}
                icon="THUMB_UP"
                variantColor="green"
                label={
                  <FormattedMessage id={argument.viewerHasVote ? 'global.cancel' : 'vote.add'} />
                }
                iconColor={argument.viewerHasVote ? 'green.500' : 'gray.500'}
              />
            </LoginOverlay>
            <Text as="span" fontSize={3} color="gray.500">
              {argument.votes.totalCount}
            </Text>
          </Flex>
        </Flex>
      </DetailDrawer.Body>
    </DetailDrawer>
  );
};

export default DebateStepPageArgumentDrawer;
