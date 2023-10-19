// @ts-nocheck
import * as React from 'react'
import { css } from 'styled-components'
import AppBox from '~ui/Primitives/AppBox'

export default {
  title: 'Design system/Primitives/AppBox',
  component: AppBox,
  argTypes: {},
}

const DefaultTemplate = (args: any) => (
  <AppBox fontSize="2xl" p={4} bg="red.300" {...args}>
    <a href="https://styled-system.com/api">Genshin Impact</a>
  </AppBox>
)

export const main = DefaultTemplate.bind({})
main.storyName = 'Default'
main.args = {}

const ResponsiveTemplate = (args: any) => (
  <AppBox display="flex" gridGap={2} {...args}>
    <AppBox
      p={2}
      bg={{
        _: 'red.300',
        lg: 'green.300',
      }}
    >
      With named response parameters. I will be red.300 on mobile until lg breakpoint, I will be green.300. Any
      undefined key in the object will define the base style
    </AppBox>
    <AppBox
      p={2}
      bg={{
        _: 'red.300',
        md: 'yellow.300',
        lg: 'green.300',
      }}
    >
      With named response parameters. I will be red.300 on mobile , yellow.300 on md breakpoint, and green.300 on lg
      breakpoint
    </AppBox>
    <AppBox p={2} bg={['red.300', 'yellow.300', 'green.300']}>
      With array parameters. It goes from the lower breakpoint and goes to the next breakpoint. I will be red.300 on
      lowest breakpoint, then yellow.300 on the tablet breakpoint and finally green.300 in the desktop breakpoint
    </AppBox>
    <AppBox p={2} bg={['red.300', null, 'green.300']}>
      You can also skip some breakpoint with the array parameter by providing a null value. Here, it will skip the
      tablet breakpoint (and thus keeping the red.300 value until desktop)
    </AppBox>
  </AppBox>
)

export const responsive = ResponsiveTemplate.bind({})
responsive.storyName = 'with responsive styles'
responsive.args = {}

const CustomCSSTemplate = (args: any) => (
  <AppBox display="flex" gridGap={2} {...args}>
    <AppBox
      p={2}
      bg="blue.300"
      color="white"
      css={css`
        p {
          &:last-of-type {
            color: ${({ theme }) => theme.colors.green[800]};
          }
        }
      `}
    >
      <p>Using css function</p>
      <p>with template litterals from</p>
      <p>styled component</p>
    </AppBox>
    <AppBox
      p={2}
      bg="yellow.400"
      css={({ theme }) => ({
        'p:last-of-type': {
          color: theme.colors.red[400],
        },
      })}
    >
      <p>Using css function</p>
      <p>with object from</p>
      <p>styled component</p>
    </AppBox>
  </AppBox>
)

export const customcss = CustomCSSTemplate.bind({})
customcss.storyName = 'with custom css'
customcss.args = {}
