// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import Card from '../../Ui/Card/Card';
import type { ProjectType_project } from './__generated__/ProjectType_project.graphql';

type Props = {
  project: ProjectType_project,
};

export class ProjectType extends React.Component<Props> {
  render() {
    const { project } = this.props;

    return project.type ? (
      <Card.Type bgColor={project.type.color}>
        <FormattedMessage id={project.type.title} />
      </Card.Type>
    ) : null;
  }
}

export default createFragmentContainer(ProjectType, {
  project: graphql`
    fragment ProjectType_project on Project {
      type {
        title
        color
      }
    }
  `,
});
