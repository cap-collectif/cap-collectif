// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import AdminEditor from '~/components/AdminEditor/Editor';

storiesOf('Back office|Editor', module).add('default case', () => {
  return <AdminEditor name="my-editor" initialContent="" onChange={() => {}} />;
});
