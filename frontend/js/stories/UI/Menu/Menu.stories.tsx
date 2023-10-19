// @ts-nocheck
import * as React from 'react'
import { useState } from 'react'
import Menu from '~ds/Menu/Menu'
import Flex from '~ui/Primitives/Layout/Flex'
import Button from '~ds/Button/Button'
import Icon, { ICON_NAME } from '~ds/Icon/Icon'
import Text from '~ui/Primitives/Text'
import Avatar from '~ds/Avatar/Avatar'
import Modal from '~ds/Modal/Modal'
import Heading from '~ui/Primitives/Heading'

export default {
  title: 'Design system/Menu',
  component: Menu,
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
    },
    closeOnSelect: {
      control: {
        type: 'boolean',
      },
    },
  },
}

const DefaultTemplate = (args: any) => (
  <Flex justify="center">
    <Menu {...args}>
      <Menu.Button>
        <Button rightIcon={ICON_NAME.ARROW_DOWN_O} variant="primary" variantSize="medium">
          Menu
        </Button>
      </Menu.Button>
      <Menu.List>
        <Menu.ListItem>
          <Text>Preferences</Text>
        </Menu.ListItem>
        <Menu.ListItem disabled color="gray.500">
          <Text>Edit (not available yet)</Text>
        </Menu.ListItem>
        <Menu.ListItem>
          <Text>Logout</Text>
        </Menu.ListItem>
      </Menu.List>
    </Menu>
  </Flex>
)

export const main = DefaultTemplate.bind({})
main.storyName = 'Default'
main.args = {}

const OptionsGroupsTemplate = () => {
  const [sorting, setSorting] = useState<string | string[]>('asc')
  const [filters, setFilters] = useState<string | string[]>(['blue'])
  return (
    <Flex justify="center">
      <Menu closeOnSelect={false}>
        <Menu.Button>
          <Button rightIcon={ICON_NAME.ARROW_DOWN_O} variant="primary" variantSize="medium">
            Menu
          </Button>
        </Menu.Button>
        <Menu.List>
          <Menu.OptionGroup value={sorting} onChange={setSorting} type="radio" title="Sorting">
            <Menu.OptionItem value="asc">
              <Text>Ascending</Text>
              <Icon ml="auto" name="ARROW_UP_O" />
            </Menu.OptionItem>
            <Menu.OptionItem value="desc">
              <Text>Descending</Text>
              <Icon ml="auto" name="ARROW_DOWN_O" />
            </Menu.OptionItem>
          </Menu.OptionGroup>
          <Menu.OptionGroup value={filters} onChange={setFilters} type="checkbox" title="Filter">
            <Menu.OptionItem value="red">
              <Text>Red</Text>
              <Avatar mr={1} size="xs" name=" " ml="auto" bg="red.400" />
            </Menu.OptionItem>
            <Menu.OptionItem value="blue">
              <Text>Blue</Text>
              <Avatar mr={1} size="xs" name=" " ml="auto" bg="blue.400" />
            </Menu.OptionItem>
            <Menu.OptionItem value="green">
              <Text>Green</Text>
              <Avatar mr={1} size="xs" name=" " ml="auto" bg="green.400" />
            </Menu.OptionItem>
          </Menu.OptionGroup>
        </Menu.List>
      </Menu>
    </Flex>
  )
}

export const withOptionGroups = OptionsGroupsTemplate.bind({})

const IconTemplate = () => (
  <Flex justify="center">
    <Menu>
      <Menu.Button>
        <Button rightIcon={ICON_NAME.ARROW_DOWN_O} variant="primary" variantSize="medium">
          Menu
        </Button>
      </Menu.Button>
      <Menu.List>
        <Menu.ListItem>
          <Icon mr={1} name="BELL" />
          <Text>Notifications</Text>
        </Menu.ListItem>
        <Menu.ListItem disabled color="gray.500">
          <Icon mr={1} name="PENCIL" />
          <Text>Edit (not available yet)</Text>
        </Menu.ListItem>
        <Menu.ListItem>
          <Icon mr={1} name="CROSS" />
          <Text>Logout</Text>
        </Menu.ListItem>
      </Menu.List>
    </Menu>
  </Flex>
)

export const withIcons = IconTemplate.bind({})

const CustomButtonTemplate = () => {
  const [sorting, setSorting] = useState<string | string[]>('asc')
  return (
    <Flex justify="center">
      <Menu>
        <Menu.Button>
          <Button rightIcon={ICON_NAME.ARROW_DOWN_O} variant="tertiary" variantSize="medium">
            Sort
          </Button>
        </Menu.Button>
        <Menu.List>
          <Menu.OptionGroup value={sorting} onChange={setSorting} type="radio">
            <Menu.OptionItem value="asc">
              <Text>Ascending</Text>
              <Icon ml="auto" name="ARROW_UP_O" />
            </Menu.OptionItem>
            <Menu.OptionItem value="desc">
              <Text>Descending</Text>
              <Icon ml="auto" name="ARROW_DOWN_O" />
            </Menu.OptionItem>
          </Menu.OptionGroup>
        </Menu.List>
      </Menu>
    </Flex>
  )
}

export const withCustomButton = CustomButtonTemplate.bind({})

const CustomPlacementTemplate = (args: any) => (
  <Flex justify="center" height="450px" align="center">
    <Menu {...args}>
      <Menu.Button>
        <Button rightIcon={ICON_NAME.ARROW_DOWN_O} variant="primary" variantSize="medium">
          Menu
        </Button>
      </Menu.Button>
      <Menu.List>
        <Menu.ListItem>
          <Icon mr={1} name="BELL" />
          <Text>Notifications</Text>
        </Menu.ListItem>
        <Menu.ListItem disabled color="gray.500">
          <Icon mr={1} name="PENCIL" />
          <Text>Edit (not available yet)</Text>
        </Menu.ListItem>
        <Menu.ListItem>
          <Icon mr={1} name="CROSS" />
          <Text>Logout</Text>
        </Menu.ListItem>
      </Menu.List>
    </Menu>
  </Flex>
)

export const withCustomPlacement = CustomPlacementTemplate.bind({})
withCustomPlacement.args = {
  placement: 'bottom-start',
}
export const WithModalOption = (args: any) => {
  return (
    <Flex justify="center" height="450px" align="center">
      <Menu {...args}>
        <Menu.Button>
          <Button rightIcon={ICON_NAME.ARROW_DOWN_O} variant="primary" variantSize="medium">
            Menu
          </Button>
        </Menu.Button>
        <Menu.List>
          <Modal
            ariaLabel="Profile"
            disclosure={
              <Menu.ListItem closeOnSelect={false}>
                <Icon mr={1} name="USER_O" />
                <Text>Open my profile</Text>
              </Menu.ListItem>
            }
          >
            <Modal.Header>
              <Heading>My profile</Heading>
            </Modal.Header>
            <Modal.Body>
              <Text>Hello from your profile</Text>
            </Modal.Body>
          </Modal>
          <Menu.ListItem disabled color="gray.500">
            <Icon mr={1} name="PENCIL" />
            <Text>Edit (not available yet)</Text>
          </Menu.ListItem>
          <Menu.ListItem>
            <Icon mr={1} name="CROSS" />
            <Text>Logout</Text>
          </Menu.ListItem>
        </Menu.List>
      </Menu>
    </Flex>
  )
}
