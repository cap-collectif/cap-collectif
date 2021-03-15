// @flow
import * as React from 'react';
import Link from '~ds/Link/Link';

export default {
  title: 'Design system/Link',
  component: Link,
  argTypes: {
    href: { control: { type: 'text' }, description: 'URL to go to' },
  },
};
const Template = (args: any) => <Link {...args}>Click here</Link>;

export const main = Template.bind({});
main.storyName = 'Default';
main.args = { href: 'https://styled-system.com/' };
