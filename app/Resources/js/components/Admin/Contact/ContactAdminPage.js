// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { type ReadyState, QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import ContactAdminList from './ContactAdminList';
import ContactAdminForm from './ContactAdminForm';

const renderContactList = ({
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
    // $FlowFixMe
    return <ContactAdminList query={props} />;
  }
  return <Loader />;
};

const ContactAdminPage = () => (
  <div className="box box-primary container-fluid">
    <div className="box-header">
      <h3 className="box-title">
        <FormattedMessage id="admin.group.content" />
      </h3>
    </div>
    <div className="box-content">
      <ContactAdminForm />{' '}
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ContactAdminPageQuery {
            ...ContactAdminList_query
          }
        `}
        variables={{}}
        render={renderContactList}
      />
    </div>
  </div>
);

export default ContactAdminPage;
