// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import type { Props } from '~/components/HomePage/LastProposals'
import Loader from '~ui/FeedbacksIndicators/Loader'

const LastProposals = lazy(
  () =>
    import(
      /* webpackChunkName: "LastProposals" */
      '~/components/HomePage/LastProposals'
    ),
)
export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers designSystem>
      <LastProposals {...props} />
    </Providers>
  </Suspense>
)
