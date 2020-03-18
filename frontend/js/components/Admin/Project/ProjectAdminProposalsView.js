// @flow
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import type { RelayRefetchProp } from 'react-relay';
import type { ProjectAdminProposalsView_project } from '~relay/ProjectAdminProposalsView_project.graphql';
import ProjectAdminProposals from '~/components/Admin/Project/ProjectAdminProposals';

type Props = {|
  +relay: RelayRefetchProp,
  +project: ProjectAdminProposalsView_project,
|};

const ProjectAdminProposalsView = ({ project }: Props) => {
  return <ProjectAdminProposals project={project} />;
};

export default createRefetchContainer(
  ProjectAdminProposalsView,
  {
    project: graphql`
      fragment ProjectAdminProposalsView_project on Project
        @argumentDefinitions(
          projectId: { type: "ID!" }
          count: { type: "Int!" }
          cursor: { type: "String" }
          orderBy: {
            type: "ProposalOrder!"
            defaultValue: { field: PUBLISHED_AT, direction: DESC }
          }
          state: { type: "ProposalsState!", defaultValue: ALL }
          category: { type: "ID", defaultValue: null }
          district: { type: "ID", defaultValue: null }
          status: { type: "ID", defaultValue: null }
          step: { type: "ID", defaultValue: null }
        ) {
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
          )
      }
    `,
  },
  graphql`
    query ProjectAdminProposalsViewRefetchQuery(
      $projectId: ID!
      $count: Int!
      $cursor: String
      $orderBy: ProposalOrder!
      $state: ProposalsState!
      $category: ID
      $district: ID
      $status: ID
      $step: ID
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
          )
      }
    }
  `,
);
