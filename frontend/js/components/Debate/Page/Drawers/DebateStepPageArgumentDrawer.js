// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDisclosure } from '@liinkiing/react-hooks';
import {Flex, Text, Button, Tag, Heading, Icon, CapUIIcon} from '@cap-collectif/ui';
import DetailDrawer from '~ds/DetailDrawer/DetailDrawer';
import NewLoginOverlay from '~/components/Utils/NewLoginOverlay';
import { voteForArgument } from '~/components/Debate/ArgumentCard/ArgumentCard';
import type { DebateStepPageArgumentDrawer_argument$key } from '~relay/DebateStepPageArgumentDrawer_argument.graphql';
import type { DebateStepPageArgumentDrawer_viewer$key } from '~relay/DebateStepPageArgumentDrawer_viewer.graphql';
import ModalReportArgumentMobile from '~/components/Debate/Page/Arguments/ModalReportArgumentMobile';
import ModalArgumentAuthorMenu from '~/components/Debate/Page/Arguments/ModalArgumentAuthorMenu';
import ModalModerateArgumentMobile from '~/components/Debate/Page/Arguments/ModalModerateArgumentMobile';
import { useDebateStepPage } from '~/components/Debate/Page/DebateStepPage.context';

type Props = {|
  +isOpen: boolean,
  +onClose?: () => void,
  +argument: DebateStepPageArgumentDrawer_argument$key,
  +viewer: ?DebateStepPageArgumentDrawer_viewer$key,
|};

const ARGUMENT_FRAGMENT = graphql`
  fragment DebateStepPageArgumentDrawer_argument on DebateArgument
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
    id
    author {
      username
    }
    type
    body
    viewerCanReport @include(if: $isAuthenticated)
    viewerDidAuthor @include(if: $isAuthenticated)
    viewerHasVote @include(if: $isAuthenticated)
    votes(first: 0) {
      totalCount
    }
    ...ModalModerateArgumentMobile_argument @include(if: $isAuthenticated)
    ...ModalArgumentAuthorMenu_argument @include(if: $isAuthenticated)
    ...ModalReportArgumentMobile_argument @include(if: $isAuthenticated)
  }
`;

const VIEWER_FRAGMENT = graphql`
  fragment DebateStepPageArgumentDrawer_viewer on User {
    isAdmin
  }
`;

const DebateStepPageArgumentDrawer = ({
  argument: argumentFragment,
  viewer: viewerFragment,
  ...drawerProps
}: Props): React.Node => {
  const argument = useFragment(ARGUMENT_FRAGMENT, argumentFragment);
  const viewer = useFragment(VIEWER_FRAGMENT, viewerFragment);
  const intl = useIntl();
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const isViewerAdmin = viewer && viewer.isAdmin;
  const { widget, stepClosed } = useDebateStepPage();

  if (!argument) return null;

  const isAuthor = argument.viewerDidAuthor;

  return (
    <DetailDrawer {...drawerProps}>
      <DetailDrawer.Header textAlign="center" justifyContent="space-between">
        <Flex direction="column" spacing={1} flex={1}>
          <Text fontWeight="bold">
            {argument.author?.username ?? intl.formatMessage({ id: 'global.anonymous' })}
          </Text>

          <Tag
            variantColor={argument.type === 'FOR' ? 'green' : 'red'}
            interactive={false}
            alignSelf="center">
            <Heading as="h5" fontWeight="700" uppercase>
              <FormattedMessage id={argument.type === 'FOR' ? 'global.for' : 'global.against'} />
            </Heading>
          </Tag>
        </Flex>

        {argument.viewerCanReport && !stepClosed && (
          <Button
            rightIcon={CapUIIcon.More}
            aria-label={intl.formatMessage({ id: 'global.menu' })}
            color="gray.500"
            onClick={onOpen}
          />
        )}

        {isViewerAdmin && !isAuthor && <ModalModerateArgumentMobile argument={argument} />}

        {isAuthor && !stepClosed && <ModalArgumentAuthorMenu argument={argument} />}
      </DetailDrawer.Header>

       <DetailDrawer.Body>
        <Text>{argument.body}</Text>
       </DetailDrawer.Body>

      <Flex
        direction="row"
        align="center"
        justify="center"
        position="fixed"
        bottom={0}
        bg="white"
        borderTopLeftRadius="16px"
        borderTopRightRadius="16px"
        width="100%"
        py={4}>
        <NewLoginOverlay enabled={!stepClosed} placement="bottom">
          <Button
            color="neutral-gray.500"
            leftIcon={<Icon name={argument.viewerHasVote ? 'CLAP' : 'CLAP_O'} size="lg" />}
            onClick={() =>
              voteForArgument(
                argument.id,
                argument.viewerHasVote,
                intl,
                argument.votes.totalCount,
                widget.location,
              )
            }
            aria-label={intl.formatMessage({
              id: argument.viewerHasVote ? 'global.cancel' : 'vote.add',
            })}
            disabled={stepClosed}
          />
        </NewLoginOverlay>
        <Text ml={1} as="span" fontSize={4} color="neutral-gray.900">
          {argument.votes.totalCount}
        </Text>
      </Flex>

      <ModalReportArgumentMobile show={isOpen} argument={argument} onClose={onClose} />
    </DetailDrawer>
  );
};

export default DebateStepPageArgumentDrawer;
