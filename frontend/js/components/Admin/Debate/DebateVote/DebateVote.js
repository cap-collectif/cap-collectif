// @flow
import * as React from 'react';
import moment from 'moment';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import { type DebateVote_vote } from '~relay/DebateVote_vote.graphql';
import Tag from '~ds/Tag/Tag';
import InlineList from '~ds/InlineList/InlineList';

type Props = {|
  +vote: DebateVote_vote,
|};

export const DebateVote = ({ vote }: Props) => {
  const intl = useIntl();
  const { __typename, type, createdAt } = vote;
  const fullName: ?string =
    __typename === 'DebateAnonymousVote'
      ? intl.formatMessage({ id: 'debate-anonymous-participation' })
      : vote.author?.firstname && vote.author?.lastname
      ? `${vote.author.firstname} ${vote.author.lastname}`
      : null;
  const username =
    __typename === 'DebateAnonymousVote'
      ? intl.formatMessage({ id: 'global.anonymous' })
      : vote.author?.username;

  return (
    <Flex direction="row" align="center" justify="space-between">
      <Flex direction="column" mr={4}>
        <Text color="blue.900" truncate={60}>
          {username}
        </Text>

        <InlineList separator="•" color="gray.600">
          {fullName && <Text truncate={50}>{fullName}</Text>}

          <Text>
            <FormattedMessage
              id="global.dates.full_day"
              values={{
                date: (
                  <FormattedDate
                    value={moment(createdAt)}
                    day="numeric"
                    month="short"
                    year="numeric"
                  />
                ),
                time: <FormattedDate value={moment(createdAt)} hour="numeric" minute="numeric" />,
              }}
            />
          </Text>
        </InlineList>
      </Flex>

      <Tag variant={type === 'FOR' ? 'green' : 'red'} interactive={false}>
        <FormattedMessage
          id={type === 'FOR' ? 'argument.show.type.for' : 'argument.show.type.against'}
        />
      </Tag>
    </Flex>
  );
};

export default createFragmentContainer(DebateVote, {
  vote: graphql`
    fragment DebateVote_vote on AbstractDebateVote {
      __typename
      type
      createdAt
      ... on DebateVote {
        author {
          username
          firstname
          lastname
        }
      }
    }
  `,
});
