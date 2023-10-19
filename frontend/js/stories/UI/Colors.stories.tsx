// @ts-nocheck
import * as React from 'react'
import Flex from '~ui/Primitives/Layout/Flex'
import Grid from '~ui/Primitives/Layout/Grid'
import baseTheme from '~/styles/theme/base'
import Text from '~ui/Primitives/Text'
import AppBox from '~ui/Primitives/AppBox'
type ColorName = string
type ColorCode = Record<number, string>
type Colors = Array<[ColorName, ColorCode]>
type ColorsNotFormatted = Array<[ColorName, ColorCode | string]>
export default {
  title: 'Design system/Colors',
  argTypes: {},
}

const Template = () => {
  const colorsList = Object.entries(baseTheme.colors) as any as ColorsNotFormatted
  const colors = colorsList.filter(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([colorName, colorValues]: [ColorName, ColorCode | string]) => typeof colorValues === 'object',
  ) as any as Colors
  return (
    <Flex direction="column" spacing={2}>
      {colors.map(([colorName, colorValues]: [ColorName, ColorCode]) => (
        <Flex direction="column">
          <Text fontWeight="semibold" fontSize={24}>
            {colorName}
          </Text>

          <Grid gridGap={4} autoFit>
            {Object.entries(colorValues).map(color => (
              <AppBox
                key={`${colorName}-${color[0]}`}
                bg={`${colorName}.${color[0]}`}
                height={100}
                p={2}
                borderRadius="normal"
                color={parseInt(color[0], 10) > 700 ? 'white' : 'black'}
              >
                <Text fontWeight="bold">{color[0]}</Text>
              </AppBox>
            ))}
          </Grid>
        </Flex>
      ))}
    </Flex>
  )
}

export const main = Template.bind({})
main.storyName = 'Default'
main.args = {}
