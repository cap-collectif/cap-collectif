/**
 * @flow
 */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Collapse } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import type FollowingsTab_viewer from './__generated__/FollowingsTab_viewer.graphql';
import UnfollowOpinionMutation from '../../../mutations/UnfollowOpinionMutation';
import UnfollowProposalMutation from '../../../mutations/UnfollowProposalMutation';
import OpinionProjectRow from './OpinionProjectRow';
import ProposalProjectRow from './ProposalProjectRow';

type Props = {
  viewer: FollowingsTab_viewer,
};
type State = {
  open: boolean,
};

export class FollowingsTab extends Component<Props, State> {
  state = {
    open: true,
  };

  onUnfollowAll() {
    const { viewer } = this.props;
    const idsProposal = viewer.followingProposals.edges.map(edge => {
      return edge.node.id;
    });
    const idsOpinions = viewer.followingOpinions.edges.map(edge => {
      return edge.node.id;
    });

    this.setState({ open: !this.state.open }, () => {
      UnfollowOpinionMutation.commit({
        input: { idsOpinions },
      });
      UnfollowProposalMutation.commit({
        input: { idsProposal },
      });
    });
  }

  render() {
    const { viewer } = this.props;
    const projectsById = {};
    viewer.followingOpinions.edges.map(edge => {
      projectsById[edge.node.project.id] = {
        type: 'opinionProject',
        object: edge.node.project,
      };
    });
    viewer.followingProposals.edges.map(edge => {
      projectsById[edge.node.project.id] = {
        type: 'proposalProject',
        object: edge.node.project,
      };
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
                {Object.keys(projectsById).map((project, id) => {
                  if (projectsById[project].type === 'opinionProject') {
                    return (
                      <OpinionProjectRow
                        key={id}
                        project={projectsById[project].object}
                        viewer={viewer}
                      />
                    );
                  }
                  return (
                    <ProposalProjectRow
                      key={id}
                      project={projectsById[project].object}
                      viewer={viewer}
                    />
                  );
                })}
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
  FollowingsTab,
  graphql`
    fragment FollowingsTab_viewer on User {
      ...ProposalProjectRow_viewer
      ...OpinionProjectRow_viewer
    }
  `,
);
