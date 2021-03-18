// @flow
import * as React from 'react';
import SkeletonText, { type SkeletonTextProps } from '~ds/Skeleton/text';

export default {
  title: 'Design system/Skeleton/SkeletonText',
  component: SkeletonText,
  argTypes: {
    size: {
      control: { type: 'select', required: true, options: ['sm', 'md', 'lg'] },
      defaultValue: 'md',
    },
  },
};

const Template = ({ size }: SkeletonTextProps) => <SkeletonText size={size} />;

export const main = Template.bind({});
main.storyName = 'Default';
main.args = {};
