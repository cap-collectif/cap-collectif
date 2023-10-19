// @ts-nocheck
import * as React from 'react'
import Grid from '~ui/Primitives/Layout/Grid'
import AppBox from '~ui/Primitives/AppBox'
import { FontWeight } from '~ui/Primitives/constants'

export default {
  title: 'Design system/Primitives/Layout/Grid',
  component: Grid,
  argTypes: {
    fitMode: {
      control: {
        type: 'select',
        options: ['auto-fill', 'auto-fit'],
      },
      default: 'auto-fit',
    },
  },
}
const content = (
  <>
    <AppBox p={2} bg="green.300">
      Venti
    </AppBox>
    <AppBox p={2} bg="red.400">
      Klee
    </AppBox>
    <AppBox p={2} bg="blue.300">
      Qiqi
    </AppBox>
    <AppBox p={2} bg="purple.600" color="white" fontWeight={FontWeight.Black}>
      Fishcl
    </AppBox>
  </>
)

const Template = (args: any) => <Grid {...args}>{content}</Grid>

export const main = Template.bind({})
main.storyName = 'Default'
main.args = {}
export const responsive = Template.bind({})
responsive.storyName = 'with responsive styles'
responsive.args = {
  templateColumns: ['1fr', '1fr 1fr', '1fr 1fr 1fr 1fr'],
  gap: [2, 4, 5],
}
export const autoFit = Template.bind({})
autoFit.storyName = 'with auto fit'
autoFit.args = {
  autoFit: true,
}
export const autoFill = Template.bind({})
autoFill.storyName = 'with auto Fill'
autoFill.args = {
  autoFill: true,
}

const customTemplate = (args: any) => {
  const isAutoFit = args.fitMode === 'auto-fit'
  return (
    <Grid
      {...(isAutoFit
        ? {
            autoFit: {
              min: args.min,
              max: args.max,
            },
          }
        : {
            autoFill: {
              min: args.min,
              max: args.max,
            },
          })}
    >
      {content}
    </Grid>
  )
}

export const autoSizing = customTemplate.bind({})
autoSizing.storyName = 'with auto sizing columns options'
autoSizing.args = {
  min: '100px',
  max: '1fr',
}
