import getBaseUrl from '@shared/utils/getBaseUrl'
import * as React from 'react'

const FranceConnectIcon = () => {
  return (
    <img
      loading="lazy"
      width="82px"
      height="40px"
      src={`${getBaseUrl()}/image/fc_transparent_colored.png`}
      alt="franceConnect"
    />
  )
}

export default FranceConnectIcon
