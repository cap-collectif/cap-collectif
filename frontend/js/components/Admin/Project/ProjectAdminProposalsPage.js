// @flow
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import environment, { graphqlError } from '~/createRelayEnvironment';
import type {
  ProjectAdminProposalsPageQueryResponse,
  ProjectAdminProposalsPageQueryVariables,
} from '~relay/ProjectAdminProposalsPageQuery.graphql';
import type { ParametersState } from '~/components/Admin/Project/ProjectAdminPage.reducer';
import ProjectAdminProposals, {
  PROJECT_ADMIN_PROPOSAL_PAGINATION,
} from '~/components/Admin/Project/ProjectAdminProposals';
import { useProjectAdminProposalsContext } from '~/components/Admin/Project/ProjectAdminPage.context';
import Loader from '~ui/FeedbacksIndicators/Loader';

type Props = {|
  +projectId: string,
|};

const createQueryVariables = (
  projectId: string,
  parameters: ParametersState,
): ProjectAdminProposalsPageQueryVariables => ({
  projectId,
  count: PROJECT_ADMIN_PROPOSAL_PAGINATION,
  cursor: null,
  orderBy: {
    field: 'PUBLISHED_AT',
    direction: parameters.sort === 'newest' ? 'DESC' : 'ASC',
  },
  state: parameters.filters.state,
  category: parameters.filters.category === 'ALL' ? null : parameters.filters.category,
  district: parameters.filters.district === 'ALL' ? null : parameters.filters.district,
  step: parameters.filters.step === 'ALL' ? null : parameters.filters.step,
  status: parameters.filters.status,
  term: parameters.filters.term,
});

const ProjectAdminProposalsPage = ({ projectId }: Props) => {
  const { parameters } = useProjectAdminProposalsContext();
  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query ProjectAdminProposalsPageQuery(
          $projectId: ID!
          $count: Int!
          $cursor: String
          $orderBy: ProposalOrder!
          $state: ProposalsState!
          $category: ID
          $district: ID
          $status: ID
          $step: ID
          $term: String
        ) {
          project: node(id: $projectId) {
            ...ProjectAdminProposals_project
              @arguments(
                projectId: $projectId
                count: $count
                cursor: $cursor
                orderBy: $orderBy
                state: $state
                category: $category
                district: $district
                status: $status
                step: $step
                term: $term
              )
          }
        }
      `}
      variables={createQueryVariables(projectId, parameters)}
      render={({
        props,
        error,
      }: {
        ...ReactRelayReadyState,
        props: ?ProjectAdminProposalsPageQueryResponse,
      }) => {
        if (error) {
          return graphqlError;
        }
        if (props && props.project) {
          return <ProjectAdminProposals project={props.project} />;
        }
        return <Loader show />;
      }}
    />
  );
};

export default ProjectAdminProposalsPage;
