import * as React from 'react'
import { ViewerSession } from '../../types'
import { AppContext } from './App.context'
import { GlobalTheme } from '@shared/navbar/NavBar.utils'

type AppProviderProps = {
  children: React.ReactNode
  viewerSession: ViewerSession
  appVersion: string
  siteColors?: GlobalTheme
}

export const AppProvider: React.FC<AppProviderProps> = ({ children, viewerSession, appVersion, siteColors }) => {
  const context = React.useMemo(
    () => ({
      viewerSession,
      appVersion,
      siteColors,
    }),
    [viewerSession, appVersion, siteColors],
  )

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>
}
