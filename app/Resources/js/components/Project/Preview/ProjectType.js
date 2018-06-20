// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import CardType from '../../Ui/Card/CardType';

const ProjectType = React.createClass({
  propTypes: {
    project: React.PropTypes.object.isRequired,
  },

  render() {
    const { project } = this.props;

    return (
      <CardType color={project.projectType.color}>
        <FormattedMessage id={project.projectType.title} />
      </CardType>
    );
  },
});

export default ProjectType;
