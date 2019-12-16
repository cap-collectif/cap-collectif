// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../createRelayEnvironment';
import IntlProvider from './IntlProvider';
import AdminRightNavbar from '../components/Admin/RightNavbar/AdminRightNavbar';
import type { AdminRightNavbarAppQueryResponse } from '~relay/AdminRightNavbarAppQuery.graphql';

export default (data: Object) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
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
    </IntlProvider>
  </Provider>
);
