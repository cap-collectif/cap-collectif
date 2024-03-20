import { Meta, Story } from '@storybook/react'
import { ListCard, ListCardProps } from '../'
import { ButtonGroup, ButtonQuickAction, CapUIIcon, Flex, Switch } from '@cap-collectif/ui'

const meta: Meta = {
  title: 'Admin-next/ListCard/ListCardItem',
  component: ListCard.Item,
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

export const Default: Story<ListCardProps> = () => (
  <ListCard.Item>
    <ListCard.Item.Label>Hello world</ListCard.Item.Label>
  </ListCard.Item>
)

export const WithType: Story<ListCardProps> = () => (
  <ListCard.Item>
    <Flex direction="column">
      <ListCard.Item.Type>Step</ListCard.Item.Type>
      <ListCard.Item.Label>Hello world</ListCard.Item.Label>
    </Flex>
  </ListCard.Item>
)

export const WithSwitch: Story<ListCardProps> = () => (
  // @ts-ignore
  <ListCard.Item as="label" htmlFor="hello-world">
    <Flex direction="column">
      <ListCard.Item.Type>Step</ListCard.Item.Type>
      <ListCard.Item.Label>Hello world</ListCard.Item.Label>
    </Flex>

    <Switch id="hello-world" />
  </ListCard.Item>
)

export const WithButtonGroup: Story<ListCardProps> = () => (
  <ListCard.Item>
    <Flex direction="column">
      <ListCard.Item.Type>Step</ListCard.Item.Type>
      <ListCard.Item.Label>Hello world</ListCard.Item.Label>
    </Flex>

    <ButtonGroup>
      <ButtonQuickAction variantColor="blue" icon={CapUIIcon.Pencil} label="Éditer" />
      <ButtonQuickAction variantColor="red" icon={CapUIIcon.Trash} label="Éditer" />
    </ButtonGroup>
  </ListCard.Item>
)
