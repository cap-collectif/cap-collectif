// @flow
import * as React from 'react';
import InlineSelect from '~ds/InlineSelect';

export default {
  title: 'Design system/InlineSelect',
  component: InlineSelect,
  argTypes: {
    value: { control: { type: 'text' }, description: 'selected value' },
    onChange: { action: 'Change' },
  },
};
const Template = (args: any) => (
  <InlineSelect {...args}>
    <InlineSelect.Choice value="published">Published</InlineSelect.Choice>
    <InlineSelect.Choice value="trashed">Draft</InlineSelect.Choice>
    <InlineSelect.Choice value="trashed">Trashed</InlineSelect.Choice>
  </InlineSelect>
);

export const main = Template.bind({});
main.storyName = 'Default';
main.args = {};

export const Selected = Template.bind({});
Selected.args = { value: 'published' };
