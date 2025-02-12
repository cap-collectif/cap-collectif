// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'

const EditProfileBox = lazy(
  () =>
    import(
      /* webpackChunkName: "EditProfileBox" */
      '~/components/User/Profile/EditProfileBox'
    ),
)
export default (props: Record<string, any>) => (
  <Suspense fallback={<Loader />}>
    <Providers designSystem>
      <EditProfileBox {...props} />
    </Providers>
  </Suspense>
)
