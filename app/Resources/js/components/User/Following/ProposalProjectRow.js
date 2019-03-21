/**
 * @flow
 */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button, Collapse, Panel, ListGroup } from 'react-bootstrap';
import UnfollowProposalMutation from '../../../mutations/UnfollowProposalMutation';
import type ProposalProjectRow_viewer from '~relay/ProposalProjectRow_viewer.graphql';
import ProposalRow from './ProposalRow';
import type { Uuid } from '../../../types';

type Props = {
  project: { id: Uuid, url: string, title: string },
  viewer: ProposalProjectRow_viewer,
};

type State = {
  open: boolean,
};

export class ProposalProjectRow extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      open: true,
    };
  }

  onUnfollowCurrentProject() {
    const { project, viewer } = this.props;
    const idsProposal = viewer.followingProposals.edges
      .filter(edge => edge.node.project.id === project.id)
      .map(edge => edge.node.__id);

    this.setState({ open: !this.state.open }, () => {
      UnfollowProposalMutation.commit({
        input: { idsProposal },
      }).then(() => true);
    });
  }

  render() {
    const { project, viewer } = this.props;
    return (
      <Collapse in={this.state.open} id={`profile-project-collapse-${project.id}`}>
        <Panel className="panel-custom">
          <Panel.Heading>
            <h3>
              <a href={project.url} title={project.title} id={`profile-project-link-${project.id}`}>
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
                .map((edge, key) => <ProposalRow key={key} proposal={edge.node} />)}
          </ListGroup>
        </Panel>
      </Collapse>
    );
  }
}

export default createFragmentContainer(
  ProposalProjectRow,
  graphql`
    fragment ProposalProjectRow_viewer on User
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 1000 }
        cursor: { type: "String", defaultValue: null }
      ) {
      followingProposals(first: $count, after: $cursor) {
        totalCount
        edges {
          node {
            ...ProposalRow_proposal
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
