// @flow
import React, { Component } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { connect, type MapStateToProps } from 'react-redux';
import EditProfileTabs from './EditProfileTabs';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import type { FeatureToggles, State } from '../../../types';

const query = graphql`
  query EditProfileBoxQuery {
    viewer {
      ...EditProfileTabs_viewer
    }
  }
`;

type Props = {
  features: FeatureToggles,
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
const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  features: state.default.features,
});
export default connect(mapStateToProps)(EditProfileBox);
