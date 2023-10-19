// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'

const CasUserNotValidModal = lazy(
  () =>
    import(
      /* webpackChunkName: "CasUserNotValidModal" */
      '~/components/User/Profile/CasUserNotValidModal'
    ),
)
export default (props: Record<string, any>) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <CasUserNotValidModal {...props} />
    </Providers>
  </Suspense>
)
