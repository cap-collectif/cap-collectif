/**
 * @flow
 */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Collapse, Panel, ListGroup } from 'react-bootstrap';
import UnfollowProposalMutation from '../../../mutations/UnfollowProposalMutation';
import type FollowingsProposals_viewer from './__generated__/FollowingsProposals_viewer.graphql';
import ProposalRow from './ProposalRow';
import type { Uuid } from '../../../types';

type Props = {
  project: { id: Uuid, url: string, title: string },
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
    const ids = viewer.followingProposals.edges
      .filter(edge => edge.node.project.id === project.id)
      .map(edge => {
        return edge.node.id;
      });

    this.setState({ open: !this.state.open }, () => {
      UnfollowProposalMutation.commit({
        input: { ids },
      }).then(() => {
        return true;
      });
    });
  }

  render() {
    const { project, viewer } = this.props;
    return (
      <Collapse in={this.state.open} id={`profile-project-collapse-${project.id}`}>
        <Panel className="panel-custom">
          <Panel.Heading>
            <h3>
              <a
                href={project.url}
                title={project.title}
                id={`profile-project-link-${project.id}`}>
                {project.title}
              </a>
            </h3>
            <Button
              id={`profile-project-unfollow-button-${project.id}`}
              onClick={() => {
                this.onUnfollowCurrentProject();
              }}>
              <FormattedMessage id="unfollow-this-project" />
            </Button>
          </Panel.Heading>
          <ListGroup className="list-group-custom">
            {viewer.followingProposals.edges &&
              viewer.followingProposals.edges
                .filter(Boolean)
                .filter(edge => edge.node.project.id === project.id)
                .map((edge, key) => {
                  return <ProposalRow key={key} proposal={edge.node} />;
                })}
          </ListGroup>
        </Panel>
      </Collapse>
    );
  }
}
export default ProjectRow;
