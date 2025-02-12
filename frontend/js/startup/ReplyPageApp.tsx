// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import type { Props } from '~/components/Reply/Profile/ReplyPage'
import Loader from '~ui/FeedbacksIndicators/Loader'

const ReplyPage = lazy(
  () =>
    import(
      /* webpackChunkName: "ReplyPage" */
      '~/components/Reply/Profile/ReplyPage'
    ),
)
export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers designSystem>
      <ReplyPage {...props} />
    </Providers>
  </Suspense>
)
