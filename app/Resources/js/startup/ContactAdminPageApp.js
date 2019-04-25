// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { type ReadyState, QueryRenderer, graphql } from 'react-relay';

import IntlProvider from './IntlProvider';
import Loader from '../components/Ui/FeedbacksIndicators/Loader';
import environment, { graphqlError } from '../createRelayEnvironment';
import ContactAdminPage from '../components/Admin/Contact/ContactAdminPage';

const renderContactAdminPage = ({
  error,
  props,
}: {
  props: any,
} & ReadyState) => {
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
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
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
    </IntlProvider>
  </Provider>
);
