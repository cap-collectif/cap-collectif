/**
 * @flow
 */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Collapse } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import type FollowingsProposals_viewer from './__generated__/FollowingsProposals_viewer.graphql';
import ProjectRow from './ProjectRow';
import UnfollowProposalMutation from '../../../mutations/UnfollowProposalMutation';

type Props = {
  viewer: FollowingsProposals_viewer,
  isAuthenticated: boolean,
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
    const ids = viewer.followingProposals.map(proposal => {
      return proposal.id;
    });

    this.setState({ open: !this.state.open }, () => {
      UnfollowProposalMutation.commit({
        input: { ids },
        isAuthenticated: this.props.isAuthenticated,
      });
    });
  }

  render() {
    const { viewer } = this.props;
    const projectsById = {};
    viewer.followingProposals.map(proposal => {
      projectsById[proposal.project.id] = proposal.project;
    });
    return (
      <div>
        <h2>
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
                  return (
                    <ProjectRow
                      key={id}
                      project={projectsById[project]}
                      isAuthenticated={this.props.isAuthenticated}
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
  FollowingsProposals,
  graphql`
    fragment FollowingsProposals_viewer on User {
      followingProposals {
        id
        title
        show_url
        project {
          id
          title
          url
        }
      }
    }
  `,
);
