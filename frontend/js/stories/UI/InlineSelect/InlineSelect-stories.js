// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import InlineSelect from '~ds/InlineSelect';

storiesOf('Design system|InlineSelect', module)
  .add('default', () => {
    return (
      <InlineSelect>
        <InlineSelect.Choice value="published">Published</InlineSelect.Choice>
        <InlineSelect.Choice value="trashed">Draft</InlineSelect.Choice>
        <InlineSelect.Choice value="trashed">Trashed</InlineSelect.Choice>
      </InlineSelect>
    );
  })
  .add('selected', () => {
    return (
      <InlineSelect value="published">
        <InlineSelect.Choice value="published">Published</InlineSelect.Choice>
        <InlineSelect.Choice value="trashed">Draft</InlineSelect.Choice>
        <InlineSelect.Choice value="trashed">Trashed</InlineSelect.Choice>
      </InlineSelect>
    );
  });
