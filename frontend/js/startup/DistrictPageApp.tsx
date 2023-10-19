// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import type { Props } from '~/components/District/DistrictPage'
import DistrictPage from '~/components/District/DistrictPage'

export default (props: Props) => (
  <Providers>
    <React.Suspense fallback={null}>
      <DistrictPage {...props} />
    </React.Suspense>
  </Providers>
)
