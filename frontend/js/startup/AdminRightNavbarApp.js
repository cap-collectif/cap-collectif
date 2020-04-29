// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Providers from './Providers';
import environment, { graphqlError } from '../createRelayEnvironment';
import AdminRightNavbar from '../components/Admin/RightNavbar/AdminRightNavbar';
import type { AdminRightNavbarAppQueryResponse } from '~relay/AdminRightNavbarAppQuery.graphql';

export default (data: Object) => (
  <Providers>
    <QueryRenderer
      environment={environment}
      query={graphql`
        query AdminRightNavbarAppQuery {
          ...AdminRightNavbar_query
        }
      `}
      variables={{}}
      render={({
        error,
        props,
      }: {
        ...ReactRelayReadyState,
        props: ?AdminRightNavbarAppQueryResponse,
      }) => {
        if (error) {
          return graphqlError;
        }
        if (props) {
          return <AdminRightNavbar query={props} {...data} />;
        }
        return null;
      }}
    />
  </Providers>
);
