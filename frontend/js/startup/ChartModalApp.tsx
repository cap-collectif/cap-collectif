// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'

const ChartModal = lazy(
  () =>
    import(
      /* webpackChunkName: "ChartModal" */
      '@shared/register/ChartModal'
    ),
)
export default () => (
  <Suspense fallback={null}>
    <Providers>
      <ChartModal />
    </Providers>
  </Suspense>
)
