/**
 * @flow
 */
import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay';
import Loader from '../../Utils/Loader';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import FollowingsProposals from "./FollowingsProposals";

const query = graphql`
  query FollowingsBoxQuery {
    viewer {
     ...FollowingsProposals_viewer
    }
  }
`;

type Props = Object;

export class FollowingsBox extends Component<Props> {
  render() {
    const renderFollowingProjectProposal = ({ props, error }) => {
      if (error) {
        console.log(error); // eslint-disable-line no-console
        return graphqlError;
      }
      if (props) {
        return <FollowingsProposals viewer={props.viewer}/>;
      }
      return <Loader />;
    };
    return (
      <Panel header={<FormattedMessage id="followings" />}>
        <QueryRenderer
          variables={{}}
          environment={environment}
          query={query}
          render={renderFollowingProjectProposal}
        />
      </Panel>
    );
  }
}

export default FollowingsBox;
