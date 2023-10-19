// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'

const EmailingParametersPageQuery = lazy(
  () =>
    import(
      /* webpackChunkName: "EmailingParametersPageQuery" */
      '~/components/Admin/Emailing/EmailingParameters/EmailingParametersPageQuery'
    ),
)
export default () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <EmailingParametersPageQuery />
    </Providers>
  </Suspense>
)
