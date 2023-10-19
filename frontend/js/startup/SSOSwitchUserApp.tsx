// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'

const SSOSwitchUserPage = lazy(
  () =>
    import(
      /* webpackChunkName: "SSOSwitchUserPage" */
      '~/components/Page/SSOSwitchUserPage'
    ),
)
export default (props: {
  destination: string | null | undefined
  user:
    | {
        username: string
      }
    | null
    | undefined
}) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <SSOSwitchUserPage {...props} />
    </Providers>
  </Suspense>
)
