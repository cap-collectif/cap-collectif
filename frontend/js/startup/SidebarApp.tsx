// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import type { Props } from '~/components/Admin/Sidebar/Sidebar'
import Sidebar from '~/components/Admin/Sidebar/Sidebar'

const SidebarApp = (props: Props) => (
  <Providers>
    <Sidebar {...props} />
  </Providers>
)

export default SidebarApp
