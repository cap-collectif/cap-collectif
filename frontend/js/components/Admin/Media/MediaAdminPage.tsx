import * as React from 'react'
import { RelayEnvironmentProvider } from 'relay-hooks'
import MediaAdminContainer from '~/components/Admin/Media/MediaAdminContainer'
import PickableList from '~ui/List/PickableList'
import environment from '~/createRelayEnvironment'
import { MediaAdminListProvider } from './MediaAdminList.context'

export const MediaAdminPage = () => (
  <PickableList.Provider>
    <RelayEnvironmentProvider environment={environment}>
      <MediaAdminListProvider>
        <MediaAdminContainer />
      </MediaAdminListProvider>
    </RelayEnvironmentProvider>
  </PickableList.Provider>
)
export default MediaAdminPage
