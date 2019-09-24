/**
 * @flow
 */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Collapse } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { type FollowingsProposals_viewer } from '~relay/FollowingsProposals_viewer.graphql';
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
    const { open } = this.state;
    const idsProposal = viewer.followingProposals.edges
      ? viewer.followingProposals.edges.filter(Boolean).map(edge => edge.node.id)
      : null;

    this.setState({ open: !open }, () => {
      UnfollowProposalMutation.commit({
        input: { idsProposal },
      });
    });
  }

  render() {
    const { viewer } = this.props;
    const { open } = this.state;
    const projectsById = {};
    if (viewer.followingProposals.edges) {
      viewer.followingProposals.edges.map(edge => {
        if (edge && edge.node && edge.node.project) {
          projectsById[edge.node.project.id] = edge.node.project;
        }
      });
    }
    return (
      <div>
        <h2 className="page-header">
          <FormattedMessage id="followings" />
          {Object.keys(projectsById).length > 0 ? (
            <Collapse style={{ float: 'right' }} in={open}>
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
            <Collapse in={open}>
              <div id="all-projects">
                {Object.keys(projectsById).map((project, id) => (
                  // $FlowFixMe
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
          <Collapse in={!open}>
            <div>
              <FormattedMessage id="no-following" />
            </div>
          </Collapse>
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(FollowingsProposals, {
  viewer: graphql`
    fragment FollowingsProposals_viewer on User
      @argumentDefinitions(count: { type: "Int", defaultValue: 1000 }, cursor: { type: "String" }) {
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
});
