// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import ContactsListView from './ContactsListView';
import type { ContactsListQueryResponse } from '~relay/ContactsListQuery.graphql';

type Props = {||};

class ContactsList extends React.Component<Props> {
  renderContactList = ({
    error,
    props,
  }: {
    ...ReactRelayReadyState,
    props: ?ContactsListQueryResponse,
  }) => {
    if (error) {
      console.log(error); // eslint-disable-line no-console
      return graphqlError;
    }
    if (props) {
      return <ContactsListView query={props} />;
    }
    return <Loader />;
  };

  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ContactsListQuery {
            ...ContactsListView_query
          }
        `}
        variables={{}}
        render={this.renderContactList}
      />
    );
  }
}

export default ContactsList;
