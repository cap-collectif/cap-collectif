// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import type { Props } from '~/components/Group/GroupCreateButton'
import Loader from '~ui/FeedbacksIndicators/Loader'

const GroupCreateButton = lazy(
  () =>
    import(
      /* webpackChunkName: "GroupCreateButton" */
      '~/components/Group/GroupCreateButton'
    ),
)
export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <GroupCreateButton {...props} />
    </Providers>
  </Suspense>
)
