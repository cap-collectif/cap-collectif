// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'

const ParisUserNotValidModal = lazy(
  () =>
    import(
      /* webpackChunkName: "ParisUserNotValidModal" */
      '~/components/User/Profile/ParisUserNotValidModal'
    ),
)
export default (props: Record<string, any>) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ParisUserNotValidModal {...props} />
    </Providers>
  </Suspense>
)
