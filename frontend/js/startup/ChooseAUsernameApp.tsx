// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'

const ChooseAUsernameModal = lazy(
  () =>
    import(
      /* webpackChunkName: "ChooseAUsernameModal" */
      '~/components/User/Profile/ChooseAUsernameModal'
    ),
)
export default (props: Record<string, any>) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ChooseAUsernameModal {...props} />
    </Providers>
  </Suspense>
)
