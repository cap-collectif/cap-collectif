/**
 * @flow
 */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Collapse } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import type FollowingsProposals_viewer from './__generated__/FollowingsProposals_viewer.graphql';
import ProposalProjectRow from './ProposalProjectRow';
import UnfollowProposalMutation from '../../../mutations/UnfollowProposalMutation';

type Props = {
  viewer: FollowingsProposals_viewer,
};
type State = {
  open: boolean,
};

export class FollowingsProposals extends Component<Props, State> {
  state = {
    open: true,
  };

  onUnfollowAll() {
    const { viewer } = this.props;
    const idsProposal = viewer.followingProposals.edges.map(edge => edge.node.id);

    this.setState({ open: !this.state.open }, () => {
      UnfollowProposalMutation.commit({
        input: { idsProposal },
      });
    });
  }

  render() {
    const { viewer } = this.props;
    const projectsById = {};
    viewer.followingProposals.edges.map(edge => {
      projectsById[edge.node.project.id] = edge.node.project;
    });
    return (
      <div>
        <h2 className="page-header">
          <FormattedMessage id="followings" />
          {Object.keys(projectsById).length > 0 ? (
            <Collapse style={{ float: 'right' }} in={this.state.open}>
              <Button
                id="unfollow-all"
                onClick={() => {
                  this.onUnfollowAll();
                }}>
                <FormattedMessage id="unfollow-all" />
              </Button>
            </Collapse>
          ) : (
            ''
          )}
        </h2>
        <div>
          {Object.keys(projectsById).length > 0 ? (
            <Collapse in={this.state.open}>
              <div id="all-projects">
                {Object.keys(projectsById).map((project, id) => (
                  <ProposalProjectRow key={id} project={projectsById[project]} viewer={viewer} />
                ))}
              </div>
            </Collapse>
          ) : (
            <div>
              <FormattedMessage id="no-following" />
            </div>
          )}
        </div>
        <div>
          <Collapse in={!this.state.open}>
            <div>
              <FormattedMessage id="no-following" />
            </div>
          </Collapse>
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(
  FollowingsProposals,
  graphql`
    fragment FollowingsProposals_viewer on User
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 1000 }
        cursor: { type: "String", defaultValue: null }
      ) {
      followingProposals(first: $count, after: $cursor) {
        totalCount
        edges {
          node {
            id
            title
            url
            project {
              id
              title
              url
            }
          }
        }
      }
    }
  `,
);
