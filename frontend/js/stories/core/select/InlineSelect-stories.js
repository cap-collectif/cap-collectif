// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import InlineSelect from '~ui/InlineSelect';

storiesOf('Core|Select/InlineSelect', module)
  .add('default', () => {
    return (
      <InlineSelect>
        <InlineSelect.Choice value="item1">Item 1</InlineSelect.Choice>
        <InlineSelect.Choice value="item2">Item 2</InlineSelect.Choice>
        <InlineSelect.Choice value="item3">Item 3</InlineSelect.Choice>
        <InlineSelect.Choice value="item3">Item 4</InlineSelect.Choice>
        <InlineSelect.Choice value="item3">Item 5</InlineSelect.Choice>
        <InlineSelect.Choice value="item3">Item 6</InlineSelect.Choice>
      </InlineSelect>
    );
  })
  .add('with selected element', () => {
    return (
      <InlineSelect value="item2">
        <InlineSelect.Choice value="item1">Item 1</InlineSelect.Choice>
        <InlineSelect.Choice value="item2">Item 2</InlineSelect.Choice>
        <InlineSelect.Choice value="item3">Item 3</InlineSelect.Choice>
        <InlineSelect.Choice value="item3">Item 4</InlineSelect.Choice>
        <InlineSelect.Choice value="item3">Item 5</InlineSelect.Choice>
        <InlineSelect.Choice value="item3">Item 6</InlineSelect.Choice>
      </InlineSelect>
    );
  });
