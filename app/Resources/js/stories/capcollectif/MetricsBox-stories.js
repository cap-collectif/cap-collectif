// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
// import Section from '../../components/Ui/BackOffice/Section';
import MetricsBox from '../../components/Ui/Metrics/MetricsBox';

storiesOf('Cap Collectif | Metricsbox', module)
  .add('default case', () => {
    return (
      <MetricsBox
        color="red"
        totalCount={50}
        icon="cap-folder-2"
        label="capco.section.metrics.projects"
      />
    );
  })
  .add('with file-icon', () => {
    return (
      <MetricsBox
        color="red"
        totalCount={50}
        icon="cap-file-1"
        label="capco.section.metrics.projects"
      />
    );
  });
