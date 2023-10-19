// @ts-nocheck
import * as React from 'react'
import Sidebar from '~/components/Admin/Sidebar/Sidebar'
import MockProviders from '~/testUtils'
import { features } from '~/redux/modules/default'

export default {
  title: 'Cap Collectif/Sidebar',
  component: Sidebar,
}

const Template = () => (
  <MockProviders
    store={{
      default: {
        features,
      },
    }}
  >
    <Sidebar appVersion="storybook" />
  </MockProviders>
)

export const main = Template.bind({})
main.storyName = 'Default'
main.args = {}
