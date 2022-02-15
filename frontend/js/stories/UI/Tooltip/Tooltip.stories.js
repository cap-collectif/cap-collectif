// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import Button from '~ds/Button/Button';
import AppBox from '~ui/Primitives/AppBox';
import Tooltip from '~ds/Tooltip/Tooltip';

export default {
  title: 'Design system/Tooltip',
  component: Tooltip,
  argTypes: {
    placement: {
      control: {
        type: 'select',
        options: [
          'auto-start',
          'auto',
          'auto-end',
          'top-start',
          'top',
          'top-end',
          'right-start',
          'right',
          'right-end',
          'bottom-end',
          'bottom',
          'bottom-start',
          'left-end',
          'left',
          'left-start',
        ],
      },
      default: 'top',
    },
  },
};
const Template = (args: any) => (
  <Flex align="center" gridGap={2}>
    <Tooltip {...args}>
      <Button variant="primary" variantSize="medium">
        Hover moi
      </Button>
    </Tooltip>
  </Flex>
);

export const main = Template.bind({});
main.storyName = 'Default';
main.args = { label: 'Salut les filles' };

const HTMLTemplate = (args: any) => (
  <Flex align="center" gridGap={2}>
    <Tooltip
      label={
        <Text textAlign="center" lineHeight="sm" fontSize={1}>
          Salut{' '}
          <AppBox as="span" fontWeight="bold" color="blue.300">
            les filles
          </AppBox>
        </Text>
      }
      {...args}>
      <Button variant="primary" variantSize="medium">
        Hover moi
      </Button>
    </Tooltip>
  </Flex>
);

export const withHTML = HTMLTemplate.bind({});
withHTML.storyName = 'with HTML content';
withHTML.args = {};

export const withCustom = Template.bind({});
withCustom.storyName = 'with customization';
withCustom.args = {
  p: 2,
  bg: 'red.700',
  label: 'Salut les filles',
};
