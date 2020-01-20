// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '~/createRelayEnvironment';
import Loader from '~/components/Ui/FeedbacksIndicators/Loader';
import type { ProjectDistrictAdminPageQueryResponse } from '~relay/ProjectDistrictAdminPageQuery.graphql';
import ProjectDistrictAdminPage from './ProjectDistrictAdminPage';

export default function ProjectDistrictAdmin() {
  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query ProjectDistrictAdminPageQuery {
          districts: projectDistricts(first: 1000)
            @connection(key: "ProjectDistrictAdminPage_districts") {
            ...ProjectDistrictAdminPage_districts
            edges {
              node {
                id
              }
            }
          }
        }
      `}
      variables={{}}
      render={({
        error,
        props: queryProps,
      }: {
        ...ReactRelayReadyState,
        props: ?ProjectDistrictAdminPageQueryResponse,
      }) => {
        if (error) {
          return graphqlError;
        }

        if (!queryProps) {
          return <Loader />;
        }
        return <ProjectDistrictAdminPage {...queryProps} />;
      }}
    />
  );
}
