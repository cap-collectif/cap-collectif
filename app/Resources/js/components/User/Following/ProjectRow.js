/**
 * @flow
 */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Collapse, Panel, ListGroupItem, ListGroup } from 'react-bootstrap';
import UnfollowProposalMutation from '../../../mutations/UnfollowProposalMutation';
import type { FollowingsProposals_viewer } from './__generated__/FollowingsProposals_viewer.graphql';
import ProposalRow from './ProposalRow';

type Props = {
  project: Object,
  viewer: FollowingsProposals_viewer,
};

type State = {
  open: boolean,
};

export class ProjectRow extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      open: true,
    };
  }

  onUnfollowCurrentProject() {
    const { project, viewer } = this.props;
    const ids = viewer.followingProposals
      .filter(proposal => proposal.project.id === project.id)
      .map(proposal => {
        return proposal.id;
      });

    this.setState({ open: !this.state.open }, () => {
      UnfollowProposalMutation.commit({ input: { ids } }).then(() => {
        return true;
      });
    });
  }

  render() {
    const { project, viewer } = this.props;
    return (
      <Collapse class="following-project" in={this.state.open}>
        <Panel
          className="following-project"
          header={
            <div>
              <h3>
                <a href={project.url} title={project.title}>
                  {project.title}
                </a>
                <Button
                  style={{ float: 'right' }}
                  onClick={this.onUnfollowCurrentProject.bind(this)}>
                  <FormattedMessage id="unfollow-this-project" />
                </Button>
              </h3>
            </div>
          }>
          <ListGroup>
            {viewer.followingProposals
              .filter(proposal => proposal.project.id === project.id)
              .map((proposal, key) => {
                return (
                  <ListGroupItem>
                    <div className="ml-25" key={`proposal_${key}`}>
                      <ProposalRow proposal={proposal} />
                    </div>
                  </ListGroupItem>
                );
              })}
          </ListGroup>
        </Panel>
      </Collapse>
    );
  }
}
export default ProjectRow;
