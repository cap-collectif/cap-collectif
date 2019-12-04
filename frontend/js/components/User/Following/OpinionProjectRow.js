/**
 * @flow
 */
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Button, Collapse, Panel } from 'react-bootstrap';
import UnfollowOpinionMutation from '../../../mutations/UnfollowOpinionMutation';
import { type OpinionProjectRow_viewer } from '~relay/OpinionProjectRow_viewer.graphql';
import OpinionRow from './OpinionRow';
import type { Uuid } from '../../../types';
import ListGroup from '../../Ui/List/ListGroup';

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
    const idsOpinion = viewer.followingOpinions.edges
      ? viewer.followingOpinions.edges
          .filter(Boolean)
          // $FlowFixMe ID seems to be nullable
          .filter(edge => edge.node.project.id === project.id)
          // $FlowFixMe ID seems to be nullable
          .map(edge => edge.node.id)
      : [];

    const { open } = this.state;
    this.setState({ open: !open }, () => {
      UnfollowOpinionMutation.commit({
        input: { idsOpinion },
      }).then(() => true);
    });
  }

  render() {
    const { project, viewer } = this.props;
    const { open } = this.state;
    return (
      <Collapse in={open} id={`profile-project-collapse-${project.id}`}>
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
          <ListGroup>
            {viewer.followingOpinions.edges &&
              viewer.followingOpinions.edges
                .filter(Boolean)
                // $FlowFixMe ID seems to be nullable
                .filter(edge => edge.node.project.id === project.id)
                .map((edge, key) => <OpinionRow key={key} opinion={edge.node} />)}
          </ListGroup>
        </Panel>
      </Collapse>
    );
  }
}
export default createFragmentContainer(OpinionProjectRow, {
  viewer: graphql`
    fragment OpinionProjectRow_viewer on User
      @argumentDefinitions(count: { type: "Int", defaultValue: 1000 }, cursor: { type: "String" }) {
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
});
