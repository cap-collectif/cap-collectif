// @flow
import * as React from 'react';
import { useQuery, graphql } from 'relay-hooks';
import { createFragmentContainer } from 'react-relay';
import isEqual from 'lodash/isEqual';
import type {
  ArgumentTabQueryResponse,
  ArgumentTabQueryVariables,
} from '~relay/ArgumentTabQuery.graphql';
import type { ArgumentTabQuery_debate } from '~relay/ArgumentTabQuery_debate.graphql';
import type { Query } from '~/types';
import ArgumentTab, { ARGUMENT_PAGINATION } from './ArgumentTab';
import Loader from '~ui/FeedbacksIndicators/Loader';
import type { ProjectAdminDebateParameters } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.reducer';
import { useProjectAdminDebateContext } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.context';
import Flex from '~ui/Primitives/Layout/Flex';
import ArgumentHeaderTab from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ArgumentTab/ArgumentHeaderTab';

type Props = {|
  +debate: ArgumentTabQuery_debate,
|};

type PropsQuery = {|
  ...Query,
  props: ArgumentTabQueryResponse,
|};

const createQueryVariables = (
  debateId: string,
  parameters: ProjectAdminDebateParameters,
): ArgumentTabQueryVariables => ({
  debateId,
  count: ARGUMENT_PAGINATION,
  cursor: null,
  value: parameters.filters.argument.type.length === 2 ? null : parameters.filters.argument.type[0],
  isPublished:
    parameters.filters.argument.state === 'PUBLISHED' ||
    parameters.filters.argument.state === 'TRASHED',
  isTrashed: parameters.filters.argument.state === 'TRASHED',
});

const queryArgument = graphql`
  query ArgumentTabQuery(
    $debateId: ID!
    $count: Int!
    $cursor: String
    $value: ForOrAgainstValue
    $isPublished: Boolean!
    $isTrashed: Boolean!
  ) {
    debate: node(id: $debateId) {
      ...ArgumentTab_debate
        @arguments(
          count: $count
          cursor: $cursor
          value: $value
          isPublished: $isPublished
          isTrashed: $isTrashed
        )
    }
  }
`;

export const initialVariables = {
  count: ARGUMENT_PAGINATION,
  cursor: null,
  value: null,
  isPublished: true,
  isTrashed: false,
};

const ArgumentTabQuery = ({ debate }: Props) => {
  const { parameters } = useProjectAdminDebateContext();

  const queryVariablesWithParameters = createQueryVariables(debate.id, parameters);

  const hasFilters: boolean = !isEqual(
    {
      ...initialVariables,
      debateId: debate.id,
    },
    queryVariablesWithParameters,
  );

  const { props: data }: PropsQuery = useQuery(queryArgument, queryVariablesWithParameters, {
    fetchPolicy: 'store-or-network',
    skip: !hasFilters,
  });

  if (debate) {
    const dataDebate: any = !hasFilters ? debate : data?.debate;

    return (
      <Flex direction="column">
        <ArgumentHeaderTab debate={debate} />
        {(hasFilters && data) || (!hasFilters && debate) ? (
          <ArgumentTab debate={dataDebate} />
        ) : (
          <Loader />
        )}
      </Flex>
    );
  }

  return <Loader />;
};

export default createFragmentContainer(ArgumentTabQuery, {
  debate: graphql`
    fragment ArgumentTabQuery_debate on Debate
      @argumentDefinitions(
        count: { type: "Int!" }
        cursor: { type: "String" }
        value: { type: "ForOrAgainstValue", defaultValue: null }
        isPublished: { type: "Boolean!" }
        isTrashed: { type: "Boolean!" }
      ) {
      id
      ...ArgumentTab_debate
        @arguments(
          count: $count
          cursor: $cursor
          value: $value
          isPublished: $isPublished
          isTrashed: $isTrashed
        )
      ...ArgumentHeaderTab_debate
    }
  `,
});
