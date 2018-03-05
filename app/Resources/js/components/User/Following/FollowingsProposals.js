/**
 * @flow
 */
import React, {Component} from 'react';
import {graphql, createFragmentContainer} from 'react-relay';
import type {FollowingsProposals_viewer} from './__generated__/FollowingsProposals_viewer.graphql'
import ProjectRow from "./ProjectRow";

type Props = {
  viewer: FollowingsProposals_viewer
};


export class FollowingsProposals extends Component<Props> {
  constructor(props, context) {
    super(props, context);

    this.state = {
      open: true
    };
  }
  render() {
    const { viewer } = this.props;
    const projects = [];
    viewer.followingProposals.map(proposal => {
      projects[proposal.project.id] = proposal.project;
    });
    return (
      <div>
        {projects.map((project, id) => {
          return (
            <div key={id}>
              <ProjectRow project={project} viewer={viewer}/>
            </div>
          );
        })}
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
