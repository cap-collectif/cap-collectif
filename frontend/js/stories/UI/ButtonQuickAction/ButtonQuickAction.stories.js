// @flow
import * as React from 'react';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon';

export default {
  title: 'Design system/ButtonQuickAction',
  component: ButtonQuickAction,
  argTypes: {
    size: {
      control: { type: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] },
      defaultValue: ICON_SIZE.MD,
    },
    variantColor: { control: { type: 'select', options: ['primary', 'danger', 'green'] } },
    label: { control: { type: 'text' } },
    iconColor: { control: { type: 'color' } },
  },
};

const Template = (args: any) => <ButtonQuickAction {...args} />;

export const Primary = Template.bind({});
Primary.args = { icon: ICON_NAME.ADD, variantColor: 'primary', label: 'Ajouter' };

export const Danger = Template.bind({});
Danger.args = { icon: ICON_NAME.TRASH, variantColor: 'danger', label: 'Supprimer' };
