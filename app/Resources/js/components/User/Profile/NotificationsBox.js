/**
 * @flow
 */
import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay';
import NotificationsForm from './NotificationsForm';
import Loader from '../../Ui/Loader';
import environment, { graphqlError } from '../../../createRelayEnvironment';

const query = graphql`
  query NotificationsBoxQuery {
    viewer {
      ...NotificationsForm_viewer
    }
  }
`;

type Props = Object;

export class NotificationsBox extends Component<Props> {
  render() {
    const renderNotificationsForm = ({ props, error }) => {
      if (error) {
        console.log(error); // eslint-disable-line no-console
        return graphqlError;
      }
      if (props) {
        return <NotificationsForm viewer={props.viewer} />;
      }
      return <Loader />;
    };
    return (
      <Panel header={<FormattedMessage id="profile.account.notifications.title" />}>
        <QueryRenderer
          variables={{}}
          environment={environment}
          query={query}
          render={renderNotificationsForm}
        />
      </Panel>
    );
  }
}

export default NotificationsBox;
