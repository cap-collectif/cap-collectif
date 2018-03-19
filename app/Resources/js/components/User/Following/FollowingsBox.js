/**
 * @flow
 */
import React, { Component } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Loader from '../../Ui/Loader';
import type { MapStateToProps } from 'react-redux';
import { connect } from 'react-redux';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import FollowingsProposals from './FollowingsProposals';
import type { State } from '../../../types';

const query = graphql`
  query FollowingsBoxQuery {
    viewer {
      ...FollowingsProposals_viewer
    }
  }
`;

type Props = {
  isAuthenticated: boolean,
};

export class FollowingsBox extends Component<Props> {
  render() {
    const renderFollowingProjectProposal = ({ props, error }) => {
      if (error) {
        console.log(error); // eslint-disable-line no-console
        return graphqlError;
      }
      if (props) {
        return (
          <FollowingsProposals viewer={props.viewer} isAuthenticated={this.props.isAuthenticated} />
        );
      }
      return <Loader />;
    };
    return (
      <div>
        <QueryRenderer
          variables={{}}
          environment={environment}
          query={query}
          render={renderFollowingProjectProposal}
        />
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => {
  return {
    isAuthenticated: state.user.user !== null,
  };
};
export default connect(mapStateToProps)(FollowingsBox);
