// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import MetricsBox from '../../components/Ui/Metrics/MetricsBox';

storiesOf('Cap Collectif | MetricsBox', module)
  .add('default case', () => {
    return (
      <MetricsBox
        color="white"
        totalCount={50}
        icon="cap-folder-2"
        label="capco.section.metrics.projects"
      />
    );
  })
  .add('with file-icon', () => {
    return (
      <MetricsBox
        color="grey"
        totalCount={50}
        icon="cap-file-1"
        label="capco.section.metrics.contributions"
      />
    );
  });
