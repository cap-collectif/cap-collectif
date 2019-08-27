// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import ContactsListView from './ContactsListView';

type Props = {};

class ContactsList extends React.Component<Props> {
  renderContactList = ({ error, props }: { props: any, ...ReadyState }) => {
    if (error) {
      console.log(error); // eslint-disable-line no-console
      return graphqlError;
    }
    if (props) {
      // $FlowFixMe
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
