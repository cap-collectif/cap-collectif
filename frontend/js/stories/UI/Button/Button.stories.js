// @flow
import * as React from 'react';
import Button from '~ds/Button/Button';
import { ICON_NAME } from '~ds/Icon/Icon';

export default {
  title: 'Design system/Button',
  component: Button,
  argTypes: {
    variant: {
      control: { type: 'select', options: ['primary', 'secondary', 'tertiary', 'link'] },
      description: 'Type of variant',
      defaultValue: 'primary',
    },
    variantSize: {
      control: { type: 'select', options: ['small', 'medium', 'big'] },
      description: 'Size of variant',
      defaultValue: 'small',
    },
    variantColor: {
      control: { type: 'select', options: ['primary', 'danger', 'hierarchy'] },
      description: 'Color of variant',
      defaultValue: 'primary',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'is the button loading',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'is the button disabled',
    },
    alternative: {
      control: { type: 'boolean' },
      description: 'is the button alternative',
    },
    onClick: { action: 'clicked' },
  },
};
const Template = (args: any) => (
  <Button
    variant={args.variant}
    variantSize={args.variantSize}
    variantColor={args.variantColor}
    isLoading={args.isLoading}
    disabled={args.disabled}
    alternative={args.alternative}
    leftIcon={args.leftIcon}
    rightIcon={args.rightIcon}
    onClick={args.onClick}>
    Action
  </Button>
);
export const Primary = Template.bind({});
Primary.args = { variant: 'primary' };

export const Secondary = Template.bind({});
Secondary.args = { variant: 'secondary' };

export const Tertiary = Template.bind({});
Tertiary.args = { variant: 'tertiary' };

export const Link = Template.bind({});
Link.args = { variant: 'link' };

export const withIcon = Template.bind({});
withIcon.args = { leftIcon: ICON_NAME.ADD };
