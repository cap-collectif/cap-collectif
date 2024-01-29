// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'

const GlobalDistrictAdmin = lazy(
  () =>
    import(
      /* webpackChunkName: "GlobalDistrictAdmin" */
      '~/components/GlobalDistrict/GlobalDistrictAdmin'
    ),
)
type Props = {}
export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <GlobalDistrictAdmin {...props} />
    </Providers>
  </Suspense>
)
