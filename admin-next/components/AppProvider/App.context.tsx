import * as React from 'react'
import { ViewerSession } from '../../types'
import { GlobalTheme } from '@shared/navbar/NavBar.utils'

type AppContext = {
  viewerSession: ViewerSession
  appVersion: string
  siteColors: GlobalTheme
}

export const AppContext = React.createContext<AppContext>({
  viewerSession: {
    email: '',
    username: '',
    id: '',
    isAdmin: true,
    isSuperAdmin: false,
    isProjectAdmin: false,
    isAdminOrganization: false,
    isOrganizationMember: false,
    isMediator: false,
    organization: null,
  },
  appVersion: '',
  siteColors: null,
})

export const useAppContext = (): AppContext => {
  const context = React.useContext(AppContext)
  if (!context) {
    throw new Error(`You can't use the AppContext outside a AppProvider component.`)
  }
  return context
}
