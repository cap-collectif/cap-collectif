// @flow
import * as React from 'react';
import moment from 'moment';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedDate, FormattedMessage } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import { type DebateVote_vote } from '~relay/DebateVote_vote.graphql';
import Tag from '~ds/Tag/Tag';
import InlineList from '~ds/InlineList/InlineList';

type Props = {|
  +vote: DebateVote_vote,
|};

export const DebateVote = ({ vote }: Props) => {
  const { type, author, createdAt } = vote;
  const userName: ?string =
    author.firstname && author.lastname ? `${author.firstname} ${author.lastname}` : null;

  return (
    <Flex direction="row" align="center" justify="space-between">
      <Flex direction="column" mr={4}>
        <Text color="blue.900" truncate={60}>
          {author.username}
        </Text>

        <InlineList separator="•" color="gray.600">
          {userName && <Text truncate={50}>{userName}</Text>}

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

      <Tag variant={type === 'FOR' ? 'green' : 'red'}>
        <FormattedMessage
          id={type === 'FOR' ? 'argument.show.type.for' : 'argument.show.type.against'}
        />
      </Tag>
    </Flex>
  );
};

export default createFragmentContainer(DebateVote, {
  vote: graphql`
    fragment DebateVote_vote on DebateVote {
      type
      createdAt
      author {
        username
        firstname
        lastname
      }
    }
  `,
});
