// @flow
import * as React from 'react';
import { boolean } from 'storybook-addon-knobs';
import { storiesOf } from '@storybook/react';
import ProgressListItem from '../../../components/Ui/List/ProgressListItem';
import ProgressList from '../../../components/Ui/List/ProgressList';

storiesOf('Core|List/ProgressList', module).add('default', () => {
  const isActive = boolean('First item is active', true);

  return (
    <ProgressList>
      <ProgressListItem item={{ title: 'Step 1', isActive }} />
      <ProgressListItem item={{ title: 'Step 2', isActive: false }} />
    </ProgressList>
  );
});
