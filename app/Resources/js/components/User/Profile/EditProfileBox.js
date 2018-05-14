// @flow
import React, { Component } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { connect, type MapStateToProps } from 'react-redux';
import EditProfileTabs from './EditProfileTabs';
import Loader from '../../Ui/Loader';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import type { FeatureToggles, State } from '../../../types';
import type EditProfileTabs_viewer from './__generated__/EditProfileBoxQuery.graphql';

const query = graphql`
  query EditProfileBoxQuery {
    viewer {
      ...EditProfileTabs_viewer
    }
  }
`;

type Props = {
  features: FeatureToggles,
  viewer: EditProfileTabs_viewer,
};

export class EditProfileBox extends Component<Props> {
  render() {
    const { features } = this.props;
    const renderEditProfile = ({ props, error }) => {
      if (error) {
        return graphqlError;
      }
      if (props) {
        if (props.viewer !== null) {
          return <EditProfileTabs viewer={props.viewer} features={features} />;
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
const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => {
  return {
    features: state.default.features,
  };
};
export default connect(mapStateToProps)(EditProfileBox);
