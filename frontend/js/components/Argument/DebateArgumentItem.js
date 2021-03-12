// @flow
import React, { useState } from 'react';
import { truncate } from 'lodash';
import { FormattedMessage, FormattedDate, useIntl } from 'react-intl';
import moment from 'moment';
import { graphql, createFragmentContainer } from 'react-relay';
import type { DebateArgumentItem_debateArgument } from '~relay/DebateArgumentItem_debateArgument.graphql';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import Tag from '~ds/Tag/Tag';
import Link from '~ds/Link/Link';
import colors from '~/styles/modules/colors';
import Button from '~ds/Button/Button';
import LoginOverlay from '~/components/Utils/LoginOverlay';
import Icon from '~ds/Icon/Icon';
import { voteForArgument, getTruncatedLength } from '~/components/Debate/ArgumentCard/ArgumentCard';
import ArgumentCardFormEdition from '~/components/Debate/ArgumentCard/ArgumentCardFormEdition';
import ModalArgumentAuthorMenu from '~/components/Debate/Page/Arguments/ModalArgumentAuthorMenu';

type Props = {|
  +debateArgument: DebateArgumentItem_debateArgument,
  +isMobile?: boolean,
  +setDeleteModalInfo: ({ id: string, type: 'FOR' | 'AGAINST' }) => void,
|};

export const DebateArgumentItem = ({ debateArgument, isMobile, setDeleteModalInfo }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [readMore, setReadMore] = useState(false);
  const intl = useIntl();

  const { step } = debateArgument.debate;
  const isAuthor = debateArgument.viewerDidAuthor;

  const isStepFinished = step.timeless
    ? false
    : step?.timeRange?.endAt
    ? moment().isAfter(moment(step.timeRange.endAt))
    : false;
  const isStartedAndNoEndDate = step.timeless
    ? false
    : !step?.timeRange?.endAt && moment().isAfter(moment(step.timeRange.startAt));
  const isStepClosed = isStepFinished || isStartedAndNoEndDate;

  return (
    <AppBox as="li" p={6} borderRadius={6} border="card" borderColor="gray.200" mb={6} bg="white">
      <Flex justifyContent="space-between" alignItems="center">
        <Link
          href={debateArgument.debate.url}
          fontSize={18}
          fontWeight={600}
          css={{
            textDecoration: 'none',
            color: colors.gray[900],
            '&:hover': { textDecoration: 'none', color: colors.blue[500] },
          }}>
          {step.title}
        </Link>

        {isAuthor &&
          !isStepClosed &&
          (!isMobile ? (
            <Flex direction="row" align="center">
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  rightIcon="PENCIL"
                  color="neutral-gray.500"
                  aria-label={intl.formatMessage({ id: 'global.edit' })}
                />
              )}
              <Button
                disabled={isEditing}
                onClick={() =>
                  setDeleteModalInfo({ id: debateArgument.id, type: debateArgument.type })
                }
                rightIcon="TRASH"
                color="neutral-gray.500"
                aria-label={intl.formatMessage({ id: 'global.delete' })}
              />
            </Flex>
          ) : (
            <ModalArgumentAuthorMenu argument={debateArgument} />
          ))}
      </Flex>
      <Flex flexDirection="row" spacing={2} alignItems="center">
        <Text pt={3} fontSize={14} fontWeight={600} color="gray.900">
          <FormattedMessage id="i-argumented" />
        </Text>
        <Tag variant={debateArgument.type === 'FOR' ? 'green' : 'red'} interactive={false}>
          <FormattedMessage
            id={
              debateArgument.type === 'FOR'
                ? 'argument.show.type.for'
                : 'argument.show.type.against'
            }
          />
        </Tag>
        <Text fontSize={14} color="gray.700" css={{ textTransform: 'lowercase' }}>
          <FormattedMessage
            id="global.dates.full_day"
            values={{
              date: (
                <FormattedDate
                  value={moment(debateArgument.publishedAt)}
                  day="numeric"
                  month="short"
                  year="numeric"
                />
              ),
              time: (
                <FormattedDate
                  value={moment(debateArgument.publishedAt)}
                  hour="numeric"
                  minute="numeric"
                />
              ),
            }}
          />
        </Text>
      </Flex>
      {isEditing ? (
        <ArgumentCardFormEdition
          argument={debateArgument}
          goBack={() => setIsEditing(false)}
          intl={intl}
        />
      ) : (
        <Text>
          {readMore
            ? debateArgument.body
            : truncate(debateArgument.body, { length: getTruncatedLength(isMobile) })}{' '}
          {getTruncatedLength(isMobile) < debateArgument.body.length && (
            <>
              &nbsp;
              <Button
                display="inline-block"
                onClick={() => {
                  setReadMore(!readMore);
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
          <LoginOverlay enabled={!isStepClosed}>
            <Button
              color="neutral-gray.500"
              leftIcon={<Icon name={debateArgument.viewerHasVote ? 'CLAP' : 'CLAP_O'} size="lg" />}
              onClick={() =>
                voteForArgument(
                  debateArgument.id,
                  debateArgument.viewerHasVote,
                  intl,
                  debateArgument.votes.totalCount,
                )
              }
              aria-label={intl.formatMessage({
                id: debateArgument.viewerHasVote ? 'global.cancel' : 'vote.add',
              })}
              disabled={isStepClosed}
            />
          </LoginOverlay>
          <Text ml={[1, 0]} as="span" fontSize={[4, 3]} color="neutral-gray.900">
            {debateArgument.votes.totalCount}
          </Text>
        </Flex>
      )}
    </AppBox>
  );
};

export default createFragmentContainer(DebateArgumentItem, {
  debateArgument: graphql`
    fragment DebateArgumentItem_debateArgument on DebateArgument
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      publishedAt
      type
      votes(first: 0) {
        totalCount
      }
      body
      viewerDidAuthor @include(if: $isAuthenticated)
      viewerHasVote @include(if: $isAuthenticated)
      ...ArgumentCardFormEdition_argument
      ...ModalArgumentAuthorMenu_argument
      debate {
        id
        url
        step {
          timeless
          timeRange {
            endAt
            startAt
          }
          id
          title
        }
      }
    }
  `,
});
