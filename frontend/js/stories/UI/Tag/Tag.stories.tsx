// @ts-nocheck
import * as React from 'react'
import Tag from '~ds/Tag/Tag'
import Flex from '~ui/Primitives/Layout/Flex'
import { ICON_NAME } from '~ds/Icon/Icon'

export default {
  title: 'Design system/Tag',
  component: Tag,
  argTypes: {
    icon: {
      control: {
        type: 'select',
        options: Object.values(ICON_NAME),
      },
    },
  },
}

const Template = (args: any) => (
  <>
    <Flex gridGap={2} wrap="wrap">
      <Tag variant="aqua">Label</Tag>
      <Tag variant="blue">Et moi un label encore plus long</Tag>
      <Tag variant="gray">Bonsoir comment</Tag>
      <Tag variant="green">allez vous en</Tag>
      <Tag variant="neutral-gray">ce</Tag>
      <Tag variant="orange">doux</Tag>
      <Tag variant="red">confinement</Tag>
      <Tag variant="yellow">Pls like share & subscribe</Tag>
    </Flex>
    <Flex gridGap={2} wrap="wrap">
      <Tag {...args}>Use controls to change this one</Tag>
    </Flex>
  </>
)

export const main = Template.bind({})
main.storyName = 'Default'
main.args = {}

const IconTemplate = () => (
  <Flex gridGap={2} wrap="wrap">
    <Tag icon={ICON_NAME.ARROW_UP} variant="neutral-gray">
      Go Up
    </Tag>
    <Tag icon={ICON_NAME.ARROW_RIGHT} variant="green">
      & Right
    </Tag>
    <Tag icon={ICON_NAME.ARROW_DOWN} variant="aqua">
      & Down
    </Tag>
    <Tag icon={ICON_NAME.ARROW_LEFT} variant="gray">
      & Left
    </Tag>
    <Tag icon={ICON_NAME.ADD} variant="blue">
      0 + 0 = la tête à toto ^^ :p
    </Tag>
    <Tag icon={ICON_NAME.BELL} variant="blue">
      Dring dring
    </Tag>
    <Tag icon={ICON_NAME.CLOCK} variant="orange">
      Confined
    </Tag>
    <Tag icon={ICON_NAME.TRASH} variant="red">
      Benett est trash tier
    </Tag>
    <Tag icon={ICON_NAME.PENCIL} variant="yellow">
      Dessin
    </Tag>
  </Flex>
)

export const withIcons = IconTemplate.bind({})
withIcons.storyName = 'with icons'
withIcons.args = {}

const AvatarTemplate = () => (
  <Flex gridGap={2} wrap="wrap">
    <Tag
      avatar={{
        src: 'https://risibank.fr/cache/stickers/d1261/126102-full.png',
        name: 'Mikasa Estucasa',
      }}
      variant="neutral-gray"
    >
      Mikasa Estucasa
    </Tag>
    <Tag
      avatar={{
        name: 'Dan Abramov',
        src: 'https://bit.ly/dan-abramov',
      }}
      variant="yellow"
    >
      Dan Abramov
    </Tag>
    <Tag
      avatar={{
        name: 'Omar Jbara',
        props: {
          bg: 'blue.500',
          color: 'white',
        },
      }}
      variant="blue"
    >
      Omar Jbara
    </Tag>
  </Flex>
)

export const withAvatars = AvatarTemplate.bind({})
withAvatars.storyName = 'with Avatars'
withAvatars.args = {}

const RemoveActionTemplate = () => (
  <Flex gridGap={2} wrap="wrap">
    <Tag
      onRemove={() => {
        window.alert("J'espère que tu as rigolé :p :) ~.~")
      }}
      icon={ICON_NAME.ADD}
      variant="blue"
    >
      0 + 0 = toto
    </Tag>
    <Tag
      onRemove={() => {
        window.alert('Coucou')
      }}
      variant="neutral-gray"
    >
      Bonsoir à tous et à toutes
    </Tag>
    <Tag
      onRemove={() => {
        window.alert('Tik Tok, on the clock')
      }}
      icon={ICON_NAME.CLOCK}
      variant="orange"
    >
      Confined
    </Tag>
    <Tag
      onRemove={() => {
        window.alert('La vérité blesse, désolée...')
      }}
      icon={ICON_NAME.TRASH}
      variant="red"
    >
      Benett trash
    </Tag>
    <Tag
      onRemove={() => {
        window.alert('pas cool dis donc')
      }}
      icon={ICON_NAME.CIRCLE_CROSS}
      variant="red"
    >
      Salut
    </Tag>
    <Tag
      avatar={{
        name: 'Erwin Smith',
        src: 'https://pm1.narvii.com/6981/6dd582abb1862f56713069173d2c2fbe9b9f68bar1-300-300v2_hq.jpg',
      }}
      onRemove={() => {
        window.alert('cool dis donc')
      }}
      variant="green"
    >
      Supprime moi
    </Tag>
  </Flex>
)

export const withonRemove = RemoveActionTemplate.bind({})
withonRemove.storyName = 'with onRemove actions'
withonRemove.args = {}

const BadegeTemplate = () => (
  <Flex align="center" gridGap={2} wrap="wrap">
    <Tag variantType="badge" variant="aqua">
      Label
    </Tag>
    <Tag icon="CLOCK" variantType="badge" variant="blue">
      Débute dans 21 jours
    </Tag>
    <Tag icon="CIRCLE_CROSS" variantType="badge" variant="red">
      Confined
    </Tag>
    <Tag variantType="badge" icon="BELL" variant="yellow">
      Pls like share & subscribe
    </Tag>
  </Flex>
)

export const asBadge = BadegeTemplate.bind({})
asBadge.storyName = 'as Badge'
asBadge.args = {}
