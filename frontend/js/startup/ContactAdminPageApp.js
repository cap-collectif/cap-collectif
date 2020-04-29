// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Providers from './Providers';
import Loader from '../components/Ui/FeedbacksIndicators/Loader';
import environment, { graphqlError } from '../createRelayEnvironment';
import ContactAdminPage from '../components/Admin/Contact/ContactAdminPage';
import type { ContactAdminPageAppQueryResponse } from '~relay/ContactAdminPageAppQuery.graphql';

const renderContactAdminPage = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?ContactAdminPageAppQueryResponse,
}) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    return <ContactAdminPage query={props} />;
  }
  return <Loader />;
};

export default () => (
  <Providers>
    <QueryRenderer
      environment={environment}
      query={graphql`
        query ContactAdminPageAppQuery {
          ...ContactAdminPage_query
        }
      `}
      variables={{}}
      render={renderContactAdminPage}
    />
  </Providers>
);
