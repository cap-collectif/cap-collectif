// @flow
import * as React from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import moment from 'moment';
import { graphql, createFragmentContainer } from 'react-relay';
import type { DebateVoteItem_vote } from '~relay/DebateVoteItem_vote.graphql';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import Tag from '~ds/Tag/Tag';
import Link from '~ds/Link/Link';
import colors from '~/styles/modules/colors';

type Props = {
  vote: DebateVoteItem_vote,
};

export const DebateVoteItem = ({ vote }: Props) => (
  <AppBox as="li" p={6} borderRadius={6} border="card" borderColor="gray.200" mb={6} bg="white">
    <Link
      href={vote.debate.url}
      fontSize={18}
      fontWeight={600}
      css={{
        textDecoration: 'none',
        color: colors.gray[900],
        '&:hover': { textDecoration: 'none', color: colors.blue[500] },
      }}>
      {vote.debate.step.title}
    </Link>
    <Flex flexDirection="row" spacing={2} alignItems="center">
      <Text pt={3} fontSize={14} fontWeight={600} color="gray.900">
        <FormattedMessage id="i-voted" />
      </Text>
      <Tag variant={vote.type === 'FOR' ? 'green' : 'red'} interactive={false}>
        <FormattedMessage
          id={vote.type === 'FOR' ? 'argument.show.type.for' : 'argument.show.type.against'}
        />
      </Tag>
      <Text fontSize={14} color="gray.700" css={{ textTransform: 'lowercase' }}>
        <FormattedMessage
          id="global.dates.full_day"
          values={{
            date: (
              <FormattedDate
                value={moment(vote.publishedAt)}
                day="numeric"
                month="short"
                year="numeric"
              />
            ),
            time: (
              <FormattedDate value={moment(vote.publishedAt)} hour="numeric" minute="numeric" />
            ),
          }}
        />
      </Text>
    </Flex>
  </AppBox>
);

export default createFragmentContainer(DebateVoteItem, {
  vote: graphql`
    fragment DebateVoteItem_vote on DebateVote {
      id
      publishedAt
      type
      debate {
        id
        url
        step {
          id
          title
        }
      }
    }
  `,
});
