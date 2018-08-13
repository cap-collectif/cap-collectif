/**
 * @flow
 */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Collapse, Panel, ListGroup } from 'react-bootstrap';
import UnfollowOpinionMutation from '../../../mutations/UnfollowOpinionMutation';
import type FollowingsOpinions_viewer from './__generated__/FollowingsOpinions_viewer.graphql';
import OpinionRow from './OpinionRow';
import type { Uuid } from '../../../types';

type Props = {
  project: { id: Uuid, url: string, title: string },
  viewer: FollowingsOpinions_viewer,
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
      .map(edge => {
        return edge.node.id;
      });

    this.setState({ open: !this.state.open }, () => {
      UnfollowOpinionMutation.commit({
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
                .map((edge, key) => {
                  return <OpinionRow key={key} opinion={edge.node} />;
                })}
          </ListGroup>
        </Panel>
      </Collapse>
    );
  }
}
export default OpinionProjectRow;
