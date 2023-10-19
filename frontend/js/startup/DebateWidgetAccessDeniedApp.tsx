// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'

const AccessDeniedPage = lazy(
  () =>
    import(
      /* webpackChunkName: "AccessDeniedPage" */
      '~/components/Debate/Page/AccessDeniedPage'
    ),
)
export default () => (
  <Suspense fallback={null}>
    <Providers>
      <AccessDeniedPage />
    </Providers>
  </Suspense>
)
