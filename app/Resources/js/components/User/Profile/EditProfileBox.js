// @flow
import React, { Component } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import EditProfileTabs from './EditProfileTabs';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import type { EditProfileBoxQueryResponse } from '~relay/EditProfileBoxQuery.graphql';

const query = graphql`
  query EditProfileBoxQuery {
    viewer {
      ...EditProfileTabs_viewer
    }
  }
`;

export class EditProfileBox extends Component<{||}> {
  render() {
    const renderEditProfile = ({
      props,
      error,
    }: {
      ...ReactRelayReadyState,
      props: ?EditProfileBoxQueryResponse,
    }) => {
      if (error) {
        return graphqlError;
      }
      if (props) {
        if (props.viewer !== null) {
          return <EditProfileTabs viewer={props.viewer} />;
        }
      }
      return <Loader />;
    };
    return (
      <div>
        <QueryRenderer
          variables={{}}
          environment={environment}
          query={query}
          render={renderEditProfile}
        />
      </div>
    );
  }
}
export default EditProfileBox;
