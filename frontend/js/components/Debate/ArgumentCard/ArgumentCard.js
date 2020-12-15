// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, useIntl, type IntlShape } from 'react-intl';
import type { ArgumentCard_argument } from '~relay/ArgumentCard_argument.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import Card from '~ds/Card/Card';
import Tag from '~ds/Tag/Tag';
import { toast } from '~ds/Toast';
import Text from '~ui/Primitives/Text';
import Heading from '~ui/Primitives/Heading';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import LoginOverlay from '~/components/Utils/LoginOverlay';
import AddDebateArgumentVoteMutation from '~/mutations/AddDebateArgumentVoteMutation';
import RemoveDebateArgumentVoteMutation from '~/mutations/RemoveDebateArgumentVoteMutation';

export type DebateOpinionStatus = 'FOR' | 'AGAINST';

type Props = {|
  +argument: ArgumentCard_argument,
|};

const errorToast = (intl: IntlShape) =>
  toast({
    variant: 'danger',
    content: intl.formatMessage({ id: 'global.error.server.form' }),
  });

const voteForArgument = (debateArgumentId: string, viewerHasVote: ?boolean, intl: IntlShape) => {
  if (viewerHasVote)
    return RemoveDebateArgumentVoteMutation.commit({ input: { debateArgumentId } })
      .then(response => {
        if (response.removeDebateArgumentVote?.errorCode) {
          errorToast(intl);
        }
      })
      .catch(() => {
        errorToast(intl);
      });
  return AddDebateArgumentVoteMutation.commit({ input: { debateArgumentId } })
    .then(response => {
      if (response.addDebateArgumentVote?.errorCode) {
        errorToast(intl);
      }
    })
    .catch(() => {
      errorToast(intl);
    });
};

export const ArgumentCard = ({ argument }: Props) => {
  const intl = useIntl();
  return (
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
              onClick={() => voteForArgument(argument.id, argument.viewerHasVote, intl)}
              mr={1}
              size="md"
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
    </Card>
  );
};

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
