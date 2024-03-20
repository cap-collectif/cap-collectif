import { Meta, Story } from '@storybook/react'
import { ListCard, ListCardProps } from './'

const meta: Meta = {
  title: 'Admin-next/ListCard',
  component: ListCard,
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

export const Default: Story<ListCardProps> = args => (
  <ListCard {...args}>
    <ListCard.Item>
      <ListCard.Item.Label>Hello world</ListCard.Item.Label>
    </ListCard.Item>
    <ListCard.Item>
      <ListCard.Item.Label>Hello Its me</ListCard.Item.Label>
    </ListCard.Item>
    <ListCard.SubItem>Who exactly ?</ListCard.SubItem>
    <ListCard.Item>
      <ListCard.Item.Label>Mario</ListCard.Item.Label>
    </ListCard.Item>
    <ListCard.Item>
      <ListCard.Item.Label>Luigi</ListCard.Item.Label>
    </ListCard.Item>
  </ListCard>
)
