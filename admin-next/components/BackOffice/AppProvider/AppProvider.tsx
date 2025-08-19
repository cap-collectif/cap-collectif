import * as React from 'react'
import { ViewerSession } from 'types'
import { AppContext } from './App.context'
import { GlobalTheme } from '@shared/navbar/NavBar.utils'
import { MapToken } from '@utils/leaflet'

type AppProviderProps = {
  children: React.ReactNode
  viewerSession: ViewerSession
  appVersion: string
  siteColors?: GlobalTheme
  mapToken?: MapToken
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  viewerSession,
  appVersion,
  siteColors,
  mapToken,
}) => {
  const context = React.useMemo(
    () => ({
      viewerSession,
      appVersion,
      siteColors,
      mapToken,
    }),
    [viewerSession, appVersion, siteColors, mapToken],
  )

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>
}
