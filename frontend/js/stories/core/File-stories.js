// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import File from '~/components/Ui/File/File';

storiesOf('Core/File', module).add('Default', () => {
  const file = {
    id: '1',
    name: 'Test.pdf',
    size: '100000',
    url: 'plop.com/Test.pdf',
    onDelete: () => {},
  };

  return <File {...file} />;
});
