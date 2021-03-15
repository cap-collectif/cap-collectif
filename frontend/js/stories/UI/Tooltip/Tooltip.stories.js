// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import Tooltip from '~ds/Tooltip/Tooltip';
import Card from '~ds/Card/Card';
import Button from '~ds/Button/Button';
import AppBox from '~ui/Primitives/AppBox';

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

export const withCustomTrigger = Template.bind({});
withCustomTrigger.storyName = 'with custom trigger';
withCustomTrigger.args = {
  label: 'Salut les filles',
  trigger: ['click'],
};

export const withoutArrow = Template.bind({});
withoutArrow.storyName = 'without arrow';
withoutArrow.args = {
  label: 'Salut les filles',
  useArrow: false,
};

const PlacementTemplate = (args: any) => (
  <Flex align="center" gridGap={2}>
    <Tooltip {...args}>
      <Flex as={Card} minHeight="100px" justify="center" align="center">
        <Text>Hover moi</Text>
      </Flex>
    </Tooltip>
    <Tooltip {...args}>
      <Flex as={Card} minHeight="200px" justify="center" align="center">
        <Text>Hover moi</Text>
      </Flex>
    </Tooltip>
    <Tooltip {...args}>
      <Flex as={Card} minHeight="250px" justify="center" align="center">
        <Text>Hover moi</Text>
      </Flex>
    </Tooltip>
    <Tooltip {...args}>
      <Flex as={Card} minHeight="400px" justify="center" align="center">
        <Text>Hover moi</Text>
      </Flex>
    </Tooltip>
  </Flex>
);

export const withPalcement = PlacementTemplate.bind({});
withPalcement.storyName = 'with placement';
withPalcement.args = {
  label: 'Salut les filles',
  placement: 'top',
};
export const disabled = Template.bind({});
disabled.args = {
  label: 'Salut les filles',
  isDisabled: true,
};

const OptionsTemplate = (args: any) => (
  <Flex align="center" gridGap={2} wrap="wrap">
    <Tooltip {...args} delay={0}>
      <Button variant="primary" variantSize="medium">
        No delay
      </Button>
    </Tooltip>
    <Tooltip {...args} delay={[500, null]}>
      <Button variant="primary" variantSize="medium">
        500ms delay on open
      </Button>
    </Tooltip>
    <Tooltip {...args} delay={[null, 500]}>
      <Button variant="primary" variantSize="medium">
        500ms delay on close
      </Button>
    </Tooltip>
    <Tooltip {...args} keepOnHover>
      <Button variant="primary" variantSize="medium">
        Keep on hover
      </Button>
    </Tooltip>
    <Tooltip {...args} showOnCreate>
      <Button variant="primary" variantSize="medium">
        Show on create
      </Button>
    </Tooltip>
  </Flex>
);

export const withOptions = OptionsTemplate.bind({});
withOptions.storyName = 'with options';
withOptions.args = { label: 'Salut les filles' };
