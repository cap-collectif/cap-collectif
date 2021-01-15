// @flow
import React, { useState } from 'react';
import { truncate } from 'lodash';
import { createFragmentContainer, graphql } from 'react-relay';
import moment from 'moment';
import { FormattedMessage, type IntlShape, useIntl } from 'react-intl';
import type { ArgumentCard_argument } from '~relay/ArgumentCard_argument.graphql';
import type { ArgumentCard_viewer } from '~relay/ArgumentCard_viewer.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import Card from '~ds/Card/Card';
import Tag from '~ds/Tag/Tag';
import Text from '~ui/Primitives/Text';
import { LineHeight } from '~ui/Primitives/constants';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import LoginOverlay from '~/components/Utils/LoginOverlay';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import AddDebateArgumentVoteMutation from '~/mutations/AddDebateArgumentVoteMutation';
import RemoveDebateArgumentVoteMutation from '~/mutations/RemoveDebateArgumentVoteMutation';
import Button from '~ds/Button/Button';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon';
import Menu from '~ds/Menu/Menu';
import ArgumentCardEdition from './ArgumentCardEdition';

export type DebateOpinionStatus = 'FOR' | 'AGAINST';

type Props = {|
  ...AppBoxProps,
  +onReadMore?: () => void,
  +argument: ArgumentCard_argument,
  +viewer: ?ArgumentCard_viewer,
  +isMobile?: boolean,
  +setReportModalId: (id: string) => void,
  +setModerateModalId: (id: string) => void,
  +setDeleteModalInfo: ({ id: string, type: DebateOpinionStatus }) => void,
|};

export const voteForArgument = (
  debateArgumentId: string,
  viewerHasVote: ?boolean,
  intl: IntlShape,
) => {
  if (viewerHasVote)
    return RemoveDebateArgumentVoteMutation.commit({ input: { debateArgumentId } })
      .then(response => {
        if (response.removeDebateArgumentVote?.errorCode) {
          mutationErrorToast(intl);
        }
      })
      .catch(() => {
        mutationErrorToast(intl);
      });
  return AddDebateArgumentVoteMutation.commit({ input: { debateArgumentId } })
    .then(response => {
      if (response.addDebateArgumentVote?.errorCode) {
        mutationErrorToast(intl);
      }
    })
    .catch(() => {
      mutationErrorToast(intl);
    });
};

const getTruncatedLength = (isMobile?: boolean): number => {
  if (isMobile) return 210;
  return 450;
};

export const ArgumentCard = ({
  argument,
  viewer,
  isMobile,
  onReadMore,
  setModerateModalId,
  setReportModalId,
  setDeleteModalInfo,
  ...props
}: Props) => {
  const isViewerAdmin = viewer && viewer.isAdmin;

  const intl = useIntl();
  const [isEditing, setIsEditing] = useState(false);
  const [readMore, setReadMore] = useState(false);

  return (
    <Card p={6} bg="white" {...props}>
      <Flex height="100%" direction="column">
        <Flex mb={2} direction="row" justifyContent="space-between" alignItems="center">
          <Flex direction="row" alignItems="center">
            <Text maxWidth="100px" mr={2}>
              {argument.author.username}
            </Text>
            <Tag variant={argument.type === 'FOR' ? 'green' : 'red'}>
              <Text as="span" fontSize={1} lineHeight={LineHeight.SM} fontWeight="700" uppercase>
                <FormattedMessage id={argument.type === 'FOR' ? 'global.for' : 'global.against'} />
              </Text>
            </Tag>
          </Flex>

          <Flex direction="row" align="center">
            <Text fontSize={[1, 3]} color="neutral-gray.500">
              {moment(argument.publishedAt)
                .startOf('day')
                .fromNow()}
            </Text>
            {isViewerAdmin && !argument.viewerDidAuthor && (
              <Button
                onClick={() => setModerateModalId(argument.id)}
                rightIcon={ICON_NAME.MODERATE}
                color="neutral-gray.500"
                p={0}
              />
            )}
            {argument.viewerDidAuthor && (
              <>
                <Button
                  disabled={isEditing}
                  onClick={() => setIsEditing(true)}
                  rightIcon={ICON_NAME.PENCIL}
                  color="neutral-gray.500"
                  p={0}
                />
                <Button
                  disabled={isEditing}
                  onClick={() => setDeleteModalInfo({ id: argument.id, type: argument.type })}
                  rightIcon={ICON_NAME.TRASH}
                  color="neutral-gray.500"
                  p={0}
                />
              </>
            )}
            {viewer && !isViewerAdmin && !argument.viewerHasReport && (
              <Menu>
                <Menu.Button as={React.Fragment}>
                  <Button
                    rightIcon={ICON_NAME.MORE}
                    aria-label={intl.formatMessage({ id: 'global.menu' })}
                    p={0}
                    color="blue.900"
                  />
                </Menu.Button>
                <Menu.List>
                  <Menu.ListItem>
                    <Button
                      onClick={() => setReportModalId(argument.id)}
                      leftIcon={ICON_NAME.FLAG}
                      color="blue.900">
                      {intl.formatMessage({ id: 'global.report.submit' })}
                    </Button>
                  </Menu.ListItem>
                </Menu.List>
              </Menu>
            )}
          </Flex>
        </Flex>
        {isEditing ? (
          <ArgumentCardEdition argument={argument} goBack={() => setIsEditing(false)} />
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
                  <FormattedMessage id={readMore ? 'see-less' : 'capco.module.read_more'} />
                </Button>
              </>
            )}
          </Text>
        )}
        <Flex
          mt={['auto', 3]}
          align="center"
          justify={['center', 'flex-start']}
          flexDirection="row">
          <LoginOverlay>
            <ButtonQuickAction
              onClick={() => voteForArgument(argument.id, argument.viewerHasVote, intl)}
              mr={1}
              size={isMobile ? ICON_SIZE.LG : ICON_SIZE.MD}
              icon="THUMB_UP"
              variantColor="green"
              label={
                <FormattedMessage id={argument.viewerHasVote ? 'global.cancel' : 'vote.add'} />
              }
              iconColor={argument.viewerHasVote ? 'green.500' : 'gray.500'}
            />
          </LoginOverlay>
          <Text ml={[1, 0]} as="span" fontSize={[4, 3]} color="neutral-gray.700">
            {argument.votes.totalCount}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
};

export default createFragmentContainer(ArgumentCard, {
  argument: graphql`
    fragment ArgumentCard_argument on DebateArgument
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      body
      votes(first: 0) {
        totalCount
      }
      author {
        id
        username
      }
      type
      publishedAt
      viewerDidAuthor @include(if: $isAuthenticated)
      viewerHasReport @include(if: $isAuthenticated)
      viewerHasVote @include(if: $isAuthenticated)
      ...ArgumentCardEdition_argument
    }
  `,
  viewer: graphql`
    fragment ArgumentCard_viewer on User {
      isAdmin
    }
  `,
});
