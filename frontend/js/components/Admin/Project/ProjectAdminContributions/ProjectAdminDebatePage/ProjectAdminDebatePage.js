// @flow
import * as React from 'react';
import { useQuery, graphql } from 'relay-hooks';
import { createFragmentContainer } from 'react-relay';
import isEqual from 'lodash/isEqual';
import type {
  ProjectAdminDebatePageQueryResponse,
  ProjectAdminDebatePageQueryVariables,
} from '~relay/ProjectAdminDebatePageQuery.graphql';
import type { ProjectAdminDebatePage_debate } from '~relay/ProjectAdminDebatePage_debate.graphql';
import type { Query } from '~/types';
import type { ProjectAdminDebatePageParameters } from './ProjectAdminDebatePage.reducer';
import { useProjectAdminDebatePageContext } from './ProjectAdminDebatePage.context';
import ProjectAdminDebate from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate';
import { ARGUMENT_PAGINATION } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ArgumentTab/ArgumentTab';
import Loader from '~ui/FeedbacksIndicators/Loader';

type Props = {|
  +debate: ProjectAdminDebatePage_debate,
  +debateId: string,
  +hasContributionsStep: boolean,
  +baseUrl: string,
|};

type PropsQuery = {|
  ...Query,
  props: ProjectAdminDebatePageQueryResponse,
|};

const createQueryVariables = (
  debateId: string,
  parameters: ProjectAdminDebatePageParameters,
): ProjectAdminDebatePageQueryVariables => ({
  debateId,
  countArgumentPagination: ARGUMENT_PAGINATION,
  cursorArgumentPagination: null,
  argumentType:
    parameters.filters.argument.type.length === 2 ? null : parameters.filters.argument.type[0],
  isPublishedArgument:
    parameters.filters.argument.state === 'PUBLISHED' ||
    parameters.filters.argument.state === 'TRASHED',
  isTrashedArgument: parameters.filters.argument.state === 'TRASHED',
});

export const queryDebate = graphql`
  query ProjectAdminDebatePageQuery(
    $debateId: ID!
    $countArgumentPagination: Int!
    $cursorArgumentPagination: String
    $argumentType: ForOrAgainstValue
    $isPublishedArgument: Boolean!
    $isTrashedArgument: Boolean!
  ) {
    debate: node(id: $debateId) {
      ...ProjectAdminDebate_debate
        @arguments(
          countArgumentPagination: $countArgumentPagination
          cursorArgumentPagination: $cursorArgumentPagination
          argumentType: $argumentType
          isPublishedArgument: $isPublishedArgument
          isTrashedArgument: $isTrashedArgument
        )
    }
  }
`;

export const initialVariables = {
  countArgumentPagination: ARGUMENT_PAGINATION,
  cursorArgumentPagination: null,
  argumentType: null,
};

const ProjectAdminDebatePage = ({ debate, hasContributionsStep, baseUrl }: Props) => {
  const { parameters } = useProjectAdminDebatePageContext();

  const queryVariablesWithParameters = createQueryVariables(debate.id, parameters);

  const hasFilters: boolean = !isEqual(
    {
      ...initialVariables,
      debateId: debate.id,
    },
    queryVariablesWithParameters,
  );

  const { props: data }: PropsQuery = useQuery(queryDebate, queryVariablesWithParameters, {
    fetchPolicy: 'store-or-network',
    skip: !hasFilters,
  });

  if ((!hasFilters && debate) || (hasFilters && data)) {
    const dataDebate: any = debate && !hasFilters ? debate : data.debate;

    return (
      <ProjectAdminDebate
        hasContributionsStep={hasContributionsStep}
        baseUrl={baseUrl}
        debate={dataDebate}
      />
    );
  }

  return <Loader />;
};

export default createFragmentContainer(ProjectAdminDebatePage, {
  debate: graphql`
    fragment ProjectAdminDebatePage_debate on Debate
      @argumentDefinitions(
        countArgumentPagination: { type: "Int!" }
        cursorArgumentPagination: { type: "String" }
        argumentType: { type: "ForOrAgainstValue", defaultValue: null }
        isPublishedArgument: { type: "Boolean!" }
        isTrashedArgument: { type: "Boolean!" }
      ) {
      id
      ...ProjectAdminDebate_debate
        @arguments(
          countArgumentPagination: $countArgumentPagination
          cursorArgumentPagination: $cursorArgumentPagination
          argumentType: $argumentType
          isPublishedArgument: $isPublishedArgument
          isTrashedArgument: $isTrashedArgument
        )
    }
  `,
});
