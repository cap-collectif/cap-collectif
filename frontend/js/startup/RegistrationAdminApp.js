// @flow
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import Providers from './Providers';
import RegistrationAdminPage from '../components/Admin/RegistrationAdminPage';
import environment, { graphqlError } from '../createRelayEnvironment';
import Loader from '../components/Ui/FeedbacksIndicators/Loader';
import type { RegistrationAdminAppQueryResponse } from '~relay/RegistrationAdminAppQuery.graphql';

const renderRegistrationAdminPage = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?RegistrationAdminAppQueryResponse,
}) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    return <RegistrationAdminPage query={props} />;
  }
  return <Loader />;
};

export default () => (
  <Providers>
    <QueryRenderer
      environment={environment}
      query={graphql`
        query RegistrationAdminAppQuery {
          ...RegistrationAdminPage_query
        }
      `}
      variables={{}}
      render={renderRegistrationAdminPage}
    />
  </Providers>
);
