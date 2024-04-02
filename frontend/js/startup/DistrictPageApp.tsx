// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import type { Props } from '~/components/District/DistrictPage'
import DistrictPage from '~/components/District/DistrictPage'

export default (props: Props) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px'
  return (
    <Providers designSystem>
      <React.Suspense fallback={null}>
        <DistrictPage {...props} />
      </React.Suspense>
    </Providers>
  )
}
