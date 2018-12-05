// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import CardType from '../../Ui/Card/CardType';

type Props = {
  project: Object,
};

class ProjectType extends React.Component<Props> {
  render() {
    const { project } = this.props;

    return (
      <CardType color={project.projectType.color}>
        <FormattedMessage id={project.projectType.title} />
      </CardType>
    );
  }
}

export default ProjectType;
