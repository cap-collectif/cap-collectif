// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import CardType from '../../Ui/Card/CardType';
import type { ProjectType_project } from './__generated__/ProjectType_project.graphql';

type Props = {
  project: ProjectType_project,
};

class ProjectType extends React.Component<Props> {
  render() {
    const { project } = this.props;
    return project.type ? (
      <CardType color={project.type.color}>
        <FormattedMessage id={project.type.title} />
      </CardType>
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
