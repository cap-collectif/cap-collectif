// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import type { ArgumentCard_argument } from '~relay/ArgumentCard_argument.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import Card from '~ds/Card/Card';
import Tag from '~ds/Tag/Tag';
import Text from '~ui/Primitives/Text';
import Heading from '~ui/Primitives/Heading';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import LoginOverlay from '~/components/Utils/LoginOverlay';

export type DebateOpinionStatus = 'FOR' | 'AGAINST';

type Props = {|
  +argument: ArgumentCard_argument,
|};

export const ArgumentCard = ({ argument }: Props) => (
  <Card p={6} bg="white">
    <Flex direction="column">
      <Flex mb={2} direction="row" justifyContent="space-between" alignItems="center">
        <Flex direction="row" alignItems="center">
          <Text mr={2}>{argument.author.username}</Text>
          <Tag variant={argument.type === 'FOR' ? 'green' : 'red'}>
            <Heading as="h5" fontWeight="700" uppercase>
              <FormattedMessage id={argument.type === 'FOR' ? 'global.for' : 'global.against'} />
            </Heading>
          </Tag>
        </Flex>
        <Flex>{argument.publishedAt}</Flex>
      </Flex>
      <Text>{argument.body}</Text>
      <Flex mt={3} alignItems="center" flexDirection="row">
        <LoginOverlay>
          <ButtonQuickAction
            mr={1}
            size="md"
            icon="THUMB_UP"
            variantColor="green"
            label="Supprimer"
            iconColor={argument.viewerHasVote ? 'green.500' : 'gray.500'}
          />
        </LoginOverlay>
        <Text as="span" fontSize={3} color="gray.500">
          {argument.votes.totalCount}
        </Text>
      </Flex>
    </Flex>
  </Card>
);

export default createFragmentContainer(ArgumentCard, {
  argument: graphql`
    fragment ArgumentCard_argument on DebateArgument
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      body
      votes {
        totalCount
      }
      author {
        username
      }
      type
      publishedAt
      viewerHasVote @include(if: $isAuthenticated)
    }
  `,
});
