// @ts-nocheck
import * as React from 'react'
import Flex from '~ui/Primitives/Layout/Flex'
import Button from '~ds/Button/Button'
import Popover from '~ds/Popover/index'
import Heading from '~ui/Primitives/Heading'
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup'

export default {
  title: 'Design system/Popover',
  component: Popover,
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
}

const Template = (args: any) => (
  <Flex align="center" gridGap={2}>
    <Popover {...args}>
      <Popover.Trigger>
        <Button variant="primary" variantSize="medium">
          Hover moi
        </Button>
      </Popover.Trigger>

      <Popover.Content>
        <Popover.Header>Header</Popover.Header>
        <Popover.Body>Body</Popover.Body>
        <Popover.Footer>Footer</Popover.Footer>
      </Popover.Content>
    </Popover>
  </Flex>
)

export const main = Template.bind({})
main.storyName = 'Default'
main.args = {}

const CustomHeaderTemplate = (args: any) => (
  <Flex align="center" gridGap={2}>
    <Popover {...args}>
      <Popover.Trigger>
        <Button variant="primary" variantSize="medium">
          Hover moi
        </Button>
      </Popover.Trigger>

      <Popover.Content>
        <Popover.Header>
          <Heading as="h2">Header</Heading>
        </Popover.Header>
        <Popover.Body>Body</Popover.Body>
        <Popover.Footer>Footer</Popover.Footer>
      </Popover.Content>
    </Popover>
  </Flex>
)

export const customHeader = CustomHeaderTemplate.bind({})
customHeader.storyName = 'with custom header'
export const withTriggerClick = Template.bind({})
withTriggerClick.storyName = 'with trigger click'
withTriggerClick.args = {
  trigger: ['click'],
}

const closeMethodTemplate = (args: any) => (
  <Flex align="center" gridGap={2}>
    <Popover {...args}>
      <Popover.Trigger>
        <Button variant="primary" variantSize="medium">
          Hover moi
        </Button>
      </Popover.Trigger>

      <Popover.Content>
        {({ closePopover }) => (
          <React.Fragment>
            <Popover.Header>Welcome</Popover.Header>
            <Popover.Body>Body</Popover.Body>
            <Popover.Footer>
              <ButtonGroup>
                <Button onClick={closePopover}>Click here to close</Button>
                <Button>Confirm</Button>
              </ButtonGroup>
            </Popover.Footer>
          </React.Fragment>
        )}
      </Popover.Content>
    </Popover>
  </Flex>
)

export const withCloseMethod = closeMethodTemplate.bind({})
withCloseMethod.storyName = 'with close method'
withCloseMethod.args = {
  trigger: ['click'],
}
