// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import type { Props } from '~/components/OpinionVersion/OpinionVersionListPage'
import Loader from '~ui/FeedbacksIndicators/Loader'

const OpinionVersionListPage = lazy(
  () =>
    import(
      /* webpackChunkName: "OpinionVersionListPage" */
      '~/components/OpinionVersion/OpinionVersionListPage'
    ),
)
export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers designSystem>
      <OpinionVersionListPage {...props} />
    </Providers>
  </Suspense>
)
