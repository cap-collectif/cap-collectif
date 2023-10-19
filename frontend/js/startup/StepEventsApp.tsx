// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import type { Props } from '~/components/Steps/StepEventsQueryRender'
import Loader from '~ui/FeedbacksIndicators/Loader'

const StepEventsQueryRender = lazy(
  () =>
    import(
      /* webpackChunkName: "StepEventsQueryRender" */
      '~/components/Steps/StepEventsQueryRender'
    ),
)
export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <StepEventsQueryRender {...props} />
    </Providers>
  </Suspense>
)
