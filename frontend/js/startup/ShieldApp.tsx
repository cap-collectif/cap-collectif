// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'

const Shield = lazy(
  () =>
    import(
      /* webpackChunkName: "Shield" */
      '~/components/Page/ShieldPage'
    ),
)
export default (props: { chartBody: string | null | undefined }) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <Shield {...props} />
    </Providers>
  </Suspense>
)
