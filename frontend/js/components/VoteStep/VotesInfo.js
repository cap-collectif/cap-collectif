// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { Box, Text } from '@cap-collectif/ui';
import type { VotesInfoQuery as VotesInfoQueryType } from '~relay/VotesInfoQuery.graphql';
import WYSIWYGRender from '../Form/WYSIWYGRender';

type Props = {|
  +stepId: string,
|};

const QUERY = graphql`
  query VotesInfoQuery($stepId: ID!) {
    voteStep: node(id: $stepId) {
      ... on SelectionStep {
        viewerVotes {
          totalCount
        }
        votesHelpText
      }
    }
  }
`;

const VotesInfo = ({ stepId }: Props) => {
  const intl = useIntl();

  const query = useLazyLoadQuery<VotesInfoQueryType>(
    QUERY,
    {
      stepId,
    },
    { fetchPolicy: 'store-and-network' },
  );

  if (!query) return null;

  const { voteStep } = query;

  const totalCount = voteStep?.viewerVotes?.totalCount;

  return (
    <Box width="100%" p={8} pt={6} color="neutral-gray.900" minHeight="100vh">
      <Text fontSize={4} mb={7} as="div">
        🗳{' '}
        {intl.formatMessage(
          { id: Number(totalCount) > 1 ? 'you-voted-for-plural' : 'you-voted-for' },
          {
            count: (
              <strong key={totalCount} style={{ color: '#CE237F' }}>
                {totalCount}
              </strong>
            ),
          },
        )}
      </Text>
      {voteStep?.votesHelpText ? <WYSIWYGRender value={voteStep?.votesHelpText} /> : null}
    </Box>
  );
};
export default VotesInfo;
