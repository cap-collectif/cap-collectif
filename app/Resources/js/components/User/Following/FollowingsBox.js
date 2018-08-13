/**
 * @flow
 */
import React, { Component } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Loader from '../../Ui/Loader';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import FollowingsProposals from './FollowingsProposals';
import FollowingsOpinions from './FollowingsOpinions';

const query = graphql`
  query FollowingsBoxQuery {
    viewer {
      ...FollowingsProposals_viewer
      ...FollowingsOpinions_viewer
    }
  }
`;

type Props = {};

export class FollowingsBox extends Component<Props> {
  render() {
    const renderFollowingProject = ({ props, error }) => {
      if (error) {
        console.log(error); // eslint-disable-line no-console
        return graphqlError;
      }
      if (props) {
        return (
          <React.Fragment>
            <FollowingsProposals viewer={props.viewer} />
            <FollowingsOpinions viewer={props.viewer} />
          </React.Fragment>
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
          render={renderFollowingProject}
        />
      </div>
    );
  }
}

export default FollowingsBox;
