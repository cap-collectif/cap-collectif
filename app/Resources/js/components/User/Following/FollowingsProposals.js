/**
 * @flow
 */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Collapse } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import type { FollowingsProposals_viewer } from './__generated__/FollowingsProposals_viewer.graphql';
import ProjectRow from './ProjectRow';
import UnfollowProposalMutation from '../../../mutations/UnfollowProposalMutation';

type Props = {
  viewer: FollowingsProposals_viewer,
};
type State = {
  open: boolean,
};

export class FollowingsProposals extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      open: true,
    };
  }

  onUnfollowAll() {
    const { viewer } = this.props;
    const ids = viewer.followingProposals.map(proposal => {
      return proposal.id;
    });

    this.setState({ open: !this.state.open }, () => {
      UnfollowProposalMutation.commit({ input: { ids } }).then(() => {
        return true;
      });
    });
  }

  render() {
    const { viewer } = this.props;
    const projects = [];
    viewer.followingProposals.map(proposal => {
      projects[parseInt(proposal.project.id, 10)] = proposal.project;
    });

    return (
      <div>
        <h2>
          <FormattedMessage id="followings" />
          {projects.length > 0 ? (
            <Collapse style={{ float: 'right' }} in={this.state.open}>
              <Button onClick={this.onUnfollowAll.bind(this)}>
                <FormattedMessage id="unfollow-all" />
              </Button>
            </Collapse>
          ) : (
            ''
          )}
        </h2>
        <div>
          {projects.length > 0 ? (
            <Collapse in={this.state.open}>
              <div>
                {projects.map((project, id) => {
                  return (
                    <div key={id}>
                      <ProjectRow project={project} viewer={viewer} />
                    </div>
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
        }
      }
    }
  `,
);
