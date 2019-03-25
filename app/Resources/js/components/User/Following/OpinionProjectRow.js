/**
 * @flow
 */
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Button, Collapse, Panel, ListGroup } from 'react-bootstrap';
import UnfollowOpinionMutation from '../../../mutations/UnfollowOpinionMutation';
import type OpinionProjectRow_viewer from './__generated__/OpinionProjectRow_viewer.graphql';
import OpinionRow from './OpinionRow';
import type { Uuid } from '../../../types';

type Props = {
  project: { id: Uuid, url: string, title: string },
  viewer: OpinionProjectRow_viewer,
};

type State = {
  open: boolean,
};

export class OpinionProjectRow extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      open: true,
    };
  }

  onUnfollowCurrentProject() {
    const { project, viewer } = this.props;
    const ids = viewer.followingOpinions.edges
      .filter(edge => edge.node.project.id === project.id)
      .map(edge => edge.node.id);

    this.setState({ open: !this.state.open }, () => {
      UnfollowOpinionMutation.commit({
        input: { ids },
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
            {viewer.followingOpinions.edges &&
              viewer.followingOpinions.edges
                .filter(Boolean)
                .filter(edge => edge.node.project.id === project.id)
                .map((edge, key) => <OpinionRow key={key} opinion={edge.node} />)}
          </ListGroup>
        </Panel>
      </Collapse>
    );
  }
}
export default createFragmentContainer(
  OpinionProjectRow,
  graphql`
    fragment OpinionProjectRow_viewer on User
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 1000 }
        cursor: { type: "String", defaultValue: null }
      ) {
      followingOpinions(first: $count, after: $cursor) {
        totalCount
        edges {
          node {
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
);
