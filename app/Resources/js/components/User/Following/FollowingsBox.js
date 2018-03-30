/**
 * @flow
 */
import React, { Component } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Loader from '../../Ui/Loader';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import FollowingsProposals from './FollowingsProposals';

const query = graphql`
  query FollowingsBoxQuery($count: Int, $cursor: String) {
    viewer {
      ...FollowingsProposals_viewer
    }
  }
`;

type Props = {};

export class FollowingsBox extends Component<Props> {
  render() {
    const renderFollowingProjectProposal = ({ props, error }) => {
      if (error) {
        console.log(error); // eslint-disable-line no-console
        return graphqlError;
      }
      if (props) {
        return <FollowingsProposals viewer={props.viewer} />;
      }
      return <Loader />;
    };
    return (
      <div>
        <QueryRenderer
          variables={{
            count: 1000,
            cursor: null,
          }}
          environment={environment}
          query={query}
          render={renderFollowingProjectProposal}
        />
      </div>
    );
  }
}

export default FollowingsBox;
