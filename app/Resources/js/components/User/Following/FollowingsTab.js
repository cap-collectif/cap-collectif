/**
 * @flow
 */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Collapse } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { type FollowingsTab_viewer } from '~relay/FollowingsTab_viewer.graphql';
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

    const idsProposal =
      viewer.followingProposals &&
      viewer.followingProposals.edges &&
      viewer.followingProposals.edges.length > 0
        ? viewer.followingProposals.edges.filter(Boolean).map(edge => edge.node.id)
        : null;
    const idsOpinion =
      viewer.followingOpinions &&
      viewer.followingOpinions.edges &&
      viewer.followingOpinions.edges.length > 0
        ? viewer.followingOpinions.edges.filter(Boolean).map(edge => edge.node.id)
        : null;

    this.setState({ open: !this.state.open }, () => {
      if (idsOpinion) {
        UnfollowOpinionMutation.commit({
          input: { idsOpinion },
        });
      }
      if (idsProposal) {
        UnfollowProposalMutation.commit({
          input: { idsProposal },
        });
      }
    });
  }

  render() {
    const { viewer } = this.props;
    const { open } = this.state;
    const projectsById = {};

    if (viewer.followingOpinions && viewer.followingOpinions.edges) {
      viewer.followingOpinions.edges.filter(Boolean).map(edge => {
        if (edge.node.project) {
          projectsById[edge.node.project.id] = {
            type: 'opinionProject',
            object: edge.node.project,
          };
        }
      });
    }

    if (viewer.followingProposals && viewer.followingProposals.edges) {
      viewer.followingProposals.edges.filter(Boolean).map(edge => {
        if (edge.node.project) {
          projectsById[edge.node.project.id] = {
            type: 'proposalProject',
            object: edge.node.project,
          };
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

export default createFragmentContainer(FollowingsTab, {
  viewer: graphql`
    fragment FollowingsTab_viewer on User
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 1000 }
        cursor: { type: "String", defaultValue: null }
      ) {
      ...ProposalProjectRow_viewer
      ...OpinionProjectRow_viewer
      followingProposals(first: $count, after: $cursor) {
        totalCount
        edges {
          node {
            id
            ...ProposalRow_proposal
            project {
              id
              title
              url
            }
          }
        }
      }
      followingOpinions(first: $count, after: $cursor) {
        totalCount
        edges {
          node {
            id
            ...OpinionRow_opinion
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
