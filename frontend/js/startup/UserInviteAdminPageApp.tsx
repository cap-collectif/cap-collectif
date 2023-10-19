// @ts-nocheck
import React, { Suspense, lazy } from 'react'
import Loader from '~ui/FeedbacksIndicators/Loader'
import Providers from '~/startup/Providers'

const UserInviteAdminPageQuery = lazy(
  () =>
    import(
      /* webpackChunkName: "UserInviteAdminPageQuery" */
      '~/components/Admin/UserInvite/UserInviteAdminPageQuery'
    ),
)
export default () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <UserInviteAdminPageQuery />
    </Providers>
  </Suspense>
)
