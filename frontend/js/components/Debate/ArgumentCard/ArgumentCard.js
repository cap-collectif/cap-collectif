// @flow
import React, { useState, type Node } from 'react';
import { truncate } from 'lodash';
import { createFragmentContainer, graphql, type RelayFragmentContainer } from 'react-relay';
import { FormattedMessage, type IntlShape, useIntl } from 'react-intl';
import { useDisclosure } from '@liinkiing/react-hooks';
import type {
  ArgumentCard_argument,
  ForOrAgainstValue,
} from '~relay/ArgumentCard_argument.graphql';
import type { ArgumentCard_viewer } from '~relay/ArgumentCard_viewer.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import Card from '~ds/Card/Card';
import Tag from '~ds/Tag/Tag';
import Text from '~ui/Primitives/Text';
import { LineHeight } from '~ui/Primitives/constants';
import LoginOverlay from '~/components/Utils/LoginOverlay';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import AddDebateArgumentVoteMutation from '~/mutations/AddDebateArgumentVoteMutation';
import RemoveDebateArgumentVoteMutation from '~/mutations/RemoveDebateArgumentVoteMutation';
import Button from '~ds/Button/Button';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import type { ModerateArgument } from '~/components/Debate/Page/Arguments/ModalModerateArgument';
import ModalArgumentAuthorMenu from '~/components/Debate/Page/Arguments/ModalArgumentAuthorMenu';
import Icon, { ICON_NAME } from '~ds/Icon/Icon';
import Menu from '~ds/Menu/Menu';
import ArgumentCardFormEdition from './ArgumentCardFormEdition';
import ModalReportArgumentMobile from '~/components/Debate/Page/Arguments/ModalReportArgumentMobile';
import ModalModerateArgumentMobile from '~/components/Debate/Page/Arguments/ModalModerateArgumentMobile';
import type { ArgumentReported } from '~/components/Debate/Page/Arguments/ModalReportArgument';
import Tooltip from '~ds/Tooltip/Tooltip';
import { useDebateStepPage } from '~/components/Debate/Page/DebateStepPage.context';
import ConditionalWrapper from '~/components/Utils/ConditionalWrapper';
import AppBox from '~ui/Primitives/AppBox';
import CookieMonster from '~/CookieMonster';

type Props = {|
  ...AppBoxProps,
  +onReadMore?: () => void,
  +argument: ArgumentCard_argument,
  +viewer: ?ArgumentCard_viewer,
  +isMobile?: boolean,
  +setArgumentReported: (argument: ArgumentReported) => void,
  +setModerateArgumentModal: (argument: ModerateArgument) => void,
  +setDeleteModalInfo: ({
    id: string,
    type: ForOrAgainstValue,
    debateUrl: string,
    hash?: ?string,
  }) => void,
|};

export const voteForArgument = (
  debateArgumentId: string,
  viewerHasVote: ?boolean,
  intl: IntlShape,
  countVotes: number,
  widgetLocation: ?string,
): Promise<void> => {
  if (viewerHasVote) {
    return RemoveDebateArgumentVoteMutation.commit({ input: { debateArgumentId } }, { countVotes })
      .then(response => {
        if (response.removeDebateArgumentVote?.errorCode) {
          mutationErrorToast(intl);
        }
      })
      .catch(() => {
        mutationErrorToast(intl);
      });
  }

  return AddDebateArgumentVoteMutation.commit(
    { input: { debateArgumentId, widgetOriginURI: widgetLocation } },
    { countVotes },
  )
    .then(response => {
      if (response.addDebateArgumentVote?.errorCode) {
        mutationErrorToast(intl);
      }
    })
    .catch(() => {
      mutationErrorToast(intl);
    });
};

export const getTruncatedLength = (isMobile?: boolean): number => {
  if (isMobile) return 210;
  return 450;
};

export const ArgumentCard = ({
  argument,
  viewer,
  isMobile,
  onReadMore,
  setModerateArgumentModal,
  setArgumentReported,
  setDeleteModalInfo,
  ...props
}: Props): Node => {
  const isViewerAdmin = viewer && viewer.isAdmin;
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const intl = useIntl();
  const { widget, stepClosed } = useDebateStepPage();
  const [isEditing, setIsEditing] = useState(false);
  const [readMore, setReadMore] = useState(false);
  const anonymousArgument = CookieMonster.getDebateAnonymousArgumentCookie(argument.debate?.id);
  const anonymousArgumentHash = CookieMonster.getHashedDebateAnonymousArgumentCookie(
    argument.debate?.id,
  );
  const isAuthor = argument.viewerDidAuthor || (anonymousArgument?.id === argument.id && !viewer);
  return (
    <Card p={6} bg="white" {...props}>
      <Flex height="100%" direction="column">
        <Flex mb={2} direction="row" justifyContent="space-between" alignItems="start">
          <Flex direction="row" alignItems="center" flexWrap="wrap">
            <Text maxWidth="100%" overflow="hidden" mr={2} mb="8px !important">
              {argument.author?.username
                ? argument.author.username
                : argument.username?.length
                ? argument.username
                : intl.formatMessage({ id: 'global.anonymous' })}
            </Text>
            <Tag
              mb={2}
              variant={argument.type === 'FOR' ? 'green' : 'red'}
              interactive={false}
              mr={2}>
              <Text as="span" fontSize={1} lineHeight={LineHeight.SM} fontWeight="700" uppercase>
                <FormattedMessage id={argument.type === 'FOR' ? 'global.for' : 'global.against'} />
              </Text>
            </Tag>

            {!argument.published && (
              <Tooltip
                label={
                  stepClosed ? intl.formatMessage({ id: 'account-not-confirmed-end-step' }) : null
                }>
                <Tag
                  mb={2}
                  maxWidth="none !important"
                  variant={stepClosed ? 'red' : 'orange'}
                  interactive={false}
                  icon={stepClosed ? ICON_NAME.CIRCLE_CROSS : ICON_NAME.CLOCK}>
                  <Text
                    as="span"
                    fontSize={1}
                    lineHeight={LineHeight.SM}
                    fontWeight="700"
                    uppercase>
                    <FormattedMessage id={stepClosed ? 'post_is_not_public' : 'publish.wait'} />
                  </Text>
                </Tag>
              </Tooltip>
            )}
          </Flex>
          <Flex direction="row" align="center">
            {isViewerAdmin &&
              !isAuthor &&
              (!isMobile ? (
                <Button
                  onClick={() =>
                    setModerateArgumentModal({
                      id: argument.id,
                      state: 'PUBLISHED',
                      debateId: argument.debate.id,
                      forOrAgainst: argument.type,
                    })
                  }
                  rightIcon={ICON_NAME.MODERATE}
                  color="neutral-gray.500"
                />
              ) : (
                <ModalModerateArgumentMobile argument={argument} />
              ))}

            {isAuthor &&
              !stepClosed &&
              (!isMobile ? (
                <>
                  {!isEditing && viewer && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      rightIcon={ICON_NAME.PENCIL}
                      color="neutral-gray.500"
                      aria-label={intl.formatMessage({ id: 'global.edit' })}
                    />
                  )}
                  <Button
                    disabled={isEditing}
                    onClick={() =>
                      setDeleteModalInfo({
                        id: argument.id,
                        type: argument.type,
                        debateUrl: argument.debate.url,
                        hash: viewer ? null : anonymousArgumentHash,
                      })
                    }
                    rightIcon={ICON_NAME.TRASH}
                    color="neutral-gray.500"
                    aria-label={intl.formatMessage({ id: 'global.delete' })}
                  />
                </>
              ) : (
                <ModalArgumentAuthorMenu argument={argument} hasViewer={!!viewer} />
              ))}

            {argument.viewerCanReport &&
              !stepClosed &&
              (!isMobile ? (
                <Menu>
                  <Menu.Button as={React.Fragment}>
                    <Button
                      rightIcon={ICON_NAME.MORE}
                      aria-label={intl.formatMessage({ id: 'global.menu' })}
                      color="gray.500"
                    />
                  </Menu.Button>
                  <Menu.List>
                    <Menu.ListItem
                      as={Button}
                      onClick={() =>
                        setArgumentReported({
                          id: argument.id,
                          debateId: argument.debate.id,
                          forOrAgainst: argument.type,
                        })
                      }
                      leftIcon={ICON_NAME.FLAG}
                      color="blue.900">
                      {intl.formatMessage({ id: 'global.report.submit' })}
                    </Menu.ListItem>
                  </Menu.List>
                </Menu>
              ) : (
                <Button
                  rightIcon={ICON_NAME.MORE}
                  aria-label={intl.formatMessage({ id: 'global.menu' })}
                  color="gray.500"
                  onClick={onOpen}
                />
              ))}
          </Flex>
        </Flex>

        {isEditing ? (
          <ArgumentCardFormEdition
            argument={argument}
            goBack={() => setIsEditing(false)}
            intl={intl}
          />
        ) : (
          <Text>
            {readMore
              ? argument.body
              : truncate(argument.body, { length: getTruncatedLength(isMobile) })}{' '}
            {getTruncatedLength(isMobile) < argument.body.length && (
              <>
                &nbsp;
                <Button
                  display="inline-block"
                  onClick={() => {
                    if (onReadMore) onReadMore();
                    else setReadMore(!readMore);
                  }}
                  variant="link">
                  <FormattedMessage id={readMore ? 'see-less' : 'global.plus'} />
                </Button>
              </>
            )}
          </Text>
        )}

        {!isEditing && (
          <Flex mt={['auto', 3]} align="center" justify="center" flexDirection="row">
            <ConditionalWrapper
              when={(viewer && !viewer?.isEmailConfirmed) || false}
              wrapper={children => (
                <Tooltip label={intl.formatMessage({ id: 'confirm-account-to-interact' })}>
                  <AppBox>{children}</AppBox>
                </Tooltip>
              )}>
              <LoginOverlay enabled={!stepClosed} placement="bottom">
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
                  disabled={stepClosed || (viewer && !viewer?.isEmailConfirmed) || false}
                />
              </LoginOverlay>
            </ConditionalWrapper>
            <Text ml={[1, 0]} as="span" fontSize={[4, 3]} color="neutral-gray.900">
              {argument.votes.totalCount}
            </Text>
          </Flex>
        )}
      </Flex>

      <ModalReportArgumentMobile show={isOpen} argument={argument} onClose={onClose} />
    </Card>
  );
};

export default (createFragmentContainer(ArgumentCard, {
  argument: graphql`
    fragment ArgumentCard_argument on AbstractDebateArgument
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      body
      votes(first: 0) {
        totalCount
      }
      ... on DebateArgument {
        author {
          id
          username
        }
        viewerDidAuthor @include(if: $isAuthenticated)
      }
      ... on DebateAnonymousArgument {
        username
      }
      debate {
        id
        url
      }
      type
      published
      viewerCanReport @include(if: $isAuthenticated)
      viewerHasVote @include(if: $isAuthenticated)
      ...ArgumentCardFormEdition_argument @include(if: $isAuthenticated)
      ...ModalArgumentAuthorMenu_argument @include(if: $isAuthenticated)
      ...ModalReportArgumentMobile_argument @include(if: $isAuthenticated)
      ...ModalModerateArgumentMobile_argument @include(if: $isAuthenticated)
    }
  `,
  viewer: graphql`
    fragment ArgumentCard_viewer on User {
      isAdmin
      isEmailConfirmed
    }
  `,
}): RelayFragmentContainer<typeof ArgumentCard>);
