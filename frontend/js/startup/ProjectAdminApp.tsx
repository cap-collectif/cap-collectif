// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'
const ProjectAdminPage = lazy(
  () =>
    import(
      /* webpackChunkName: "ProjectAdminPage" */
      '~/components/Admin/Project/ProjectAdminPage'
    ),
)
type ProjectAdminAppProps = {
  readonly projectId: string | null | undefined
  readonly firstCollectStepId: string | null | undefined
}

const ProjectAdminApp = ({ projectId, firstCollectStepId }: ProjectAdminAppProps) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ProjectAdminPage projectId={projectId} firstCollectStepId={firstCollectStepId} />
    </Providers>
  </Suspense>
)

export default ProjectAdminApp
