// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import type { Props } from '~/components/Admin/Sidebar/Sidebar'
import Sidebar from '~/components/Admin/Sidebar/Sidebar'

const SidebarApp = ({ currentRouteParams, ...props }: Props) => {
  const isUsingDesignSystem =
    currentRouteParams.includes('capco_admin_alpha_project') &&
    currentRouteParams !== 'capco_admin_alpha_project_createProposal'
  return (
    <Providers designSystem={isUsingDesignSystem}>
      <Sidebar {...props} designSystem={isUsingDesignSystem} />
    </Providers>
  )
}

export default SidebarApp
