// @flow
import * as React from 'react';
import { useQuery, graphql } from 'relay-hooks';
import { createFragmentContainer } from 'react-relay';
import isEqual from 'lodash/isEqual';
import type { VoteTabQueryResponse, VoteTabQueryVariables } from '~relay/VoteTabQuery.graphql';
import type { VoteTabQuery_debate } from '~relay/VoteTabQuery_debate.graphql';
import type { Query } from '~/types';
import Loader from '~ui/FeedbacksIndicators/Loader';
import VoteTab, { VOTE_PAGINATION } from './VoteTab';

type Props = {|
  +debate: VoteTabQuery_debate,
|};

type PropsQuery = {|
  ...Query,
  props: VoteTabQueryResponse,
|};

const createQueryVariables = (debateId: string): VoteTabQueryVariables => ({
  debateId,
  count: VOTE_PAGINATION,
  cursor: null,
});

const queryVote = graphql`
  query VoteTabQuery($debateId: ID!, $count: Int!, $cursor: String) {
    debate: node(id: $debateId) {
      ...VoteTab_debate @arguments(count: $count, cursor: $cursor)
    }
  }
`;

export const initialVariables = {
  // VOTE
  count: VOTE_PAGINATION,
  cursor: null,
};

const VoteTabQuery = ({ debate }: Props) => {
  const queryVariablesWithParameters = createQueryVariables(debate.id);

  const hasFilters: boolean = !isEqual(
    {
      ...initialVariables,
      debateId: debate.id,
    },
    queryVariablesWithParameters,
  );

  const { props: data }: PropsQuery = useQuery(queryVote, queryVariablesWithParameters, {
    fetchPolicy: 'store-or-network',
    skip: !hasFilters,
  });

  if ((!hasFilters && debate) || (hasFilters && data)) {
    const dataDebate: any = debate && !hasFilters ? debate : data.debate;

    return <VoteTab debate={dataDebate} />;
  }

  return <Loader />;
};

export default createFragmentContainer(VoteTabQuery, {
  debate: graphql`
    fragment VoteTabQuery_debate on Debate
      @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }) {
      id
      ...VoteTab_debate @arguments(count: $count, cursor: $cursor)
    }
  `,
});
