// @flow

import React from 'react';

type Props = {
  projectSteps: Array<Object>,
};

export class ProjectStepTabs extends React.Component<Props> {
  render() {
    const { projectSteps } = this.props;
    console.log(projectSteps[0].title);

    return <div>{projectSteps.map(step => <div>{step.title}</div>)}</div>;
  }
}

export default ProjectStepTabs;
