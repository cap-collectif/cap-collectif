// @flow
import React from 'react';
import { RelayEnvironmentProvider } from 'relay-hooks';
import { graphql, QueryRenderer } from 'react-relay';
import AlertBoxApp from '~/startup/AlertBoxApp';
import environment, { graphqlError } from '~/createRelayEnvironment';
import HomePageProjectsSectionAdminPage from '~/components/Admin/Section/HomePageProjectsSectionAdminPage';
import Loader from '~ui/FeedbacksIndicators/Loader';
import type { HomePageProjectsSectionAdminAppQueryResponse } from '~relay/HomePageProjectsSectionAdminAppQuery.graphql';

const query = graphql`
  query HomePageProjectsSectionAdminAppQuery($first: Int!, $cursor: String) {
    homePageProjectsSectionAdmin {
      ...HomePageProjectsSectionAdminPage_homePageProjectsSectionAdmin
      ...HomePageProjectsSectionAdminPageDisplayCustom_homePageProjectsSectionAdmin
    }
    ...HomePageProjectsSectionAdminPageDisplayMostRecent_query
      @arguments(first: $first, cursor: $cursor)
    ...HomePageProjectsSectionAdminPageDisplayCustom_query
  }
`;

export default () => (
  <AlertBoxApp>
    <RelayEnvironmentProvider environment={environment}>
      <QueryRenderer
        environment={environment}
        query={query}
        variables={{
          first: 0,
          cursor: null,
        }}
        render={({
          error,
          props,
        }: {
          ...ReactRelayReadyState,
          props: ?HomePageProjectsSectionAdminAppQueryResponse,
        }) => {
          if (error) {
            return graphqlError;
          }
          if (props && props?.homePageProjectsSectionAdmin) {
            return (
              <HomePageProjectsSectionAdminPage
                {...props}
                paginatedProjectsFragmentRef={props}
                allProjectsFragmentRef={props}
                homePageProjectsSectionAdminFragmentRef={props?.homePageProjectsSectionAdmin}
              />
            );
          }
          return <Loader />;
        }}
      />
    </RelayEnvironmentProvider>
  </AlertBoxApp>
);
