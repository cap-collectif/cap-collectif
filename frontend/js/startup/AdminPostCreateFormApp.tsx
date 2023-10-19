// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'
const AdminPostCreateForm = lazy(
  () =>
    import(
      /* webpackChunkName: "PostFormQuery" */
      '~/components/Admin/Post/PostForm/PostFormQuery'
    ),
)
type Props = {
  readonly postId: string
  readonly isAdmin: boolean
  readonly proposalId: string
}
export default ({ postId, isAdmin, proposalId }: Props) => (
  <Providers>
    <Suspense fallback={<Loader />}>
      <AdminPostCreateForm postId={postId} isAdmin={isAdmin} proposalId={proposalId} />
    </Suspense>
  </Providers>
)
