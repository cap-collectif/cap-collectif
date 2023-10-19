// @ts-nocheck
import * as React from 'react'
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon'
import Text from '~ui/Primitives/Text'
import Grid from '~ui/Primitives/Layout/Grid'
import Flex from '~ui/Primitives/Layout/Flex'
const listIconName = Object.values(ICON_NAME).sort() as any as string[]
const listIconSize = Object.keys(ICON_SIZE).reverse() as any as string[]
export default {
  title: 'Design system/Icons',
  component: Icon,
  argTypes: {
    name: {
      control: {
        type: 'select',
        options: listIconName,
      },
      description: 'Name of the icon',
    },
    size: {
      control: {
        type: 'select',
        options: listIconSize,
      },
      description: 'Size of the icon',
    },
    color: {
      control: {
        type: 'color',
      },
      description: 'Color of the icon',
    },
    className: {
      control: {
        type: 'text',
      },
      description: 'Classname',
    },
  },
}

const DefaultTemplate = (args: any) => (
  <Grid gridGap={6} autoFit>
    {listIconName.map(icon => (
      <Flex key={icon} direction="column" align="center">
        <Icon name={ICON_NAME[icon]} size={ICON_SIZE.LG} color={args.color} />
        <Text>{icon}</Text>
      </Flex>
    ))}
  </Grid>
)

export const main = DefaultTemplate.bind({})

const SecondaryTemplate = (args: any) => (
  <Grid gridGap={6} templateColumns={['1fr 1fr 1fr 1fr']}>
    {listIconName.map(icon => (
      <Flex key={icon} borderRadius="normal" direction="column">
        <Flex direction="row">
          {listIconSize.map(size => (
            <Icon name={ICON_NAME[icon]} size={ICON_SIZE[size]} color={args.color} />
          ))}
        </Flex>
        <Text>{icon}</Text>
      </Flex>
    ))}
  </Grid>
)

export const withSize = SecondaryTemplate.bind({})
