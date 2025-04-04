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

const ProjectAdminApp = ({ projectId, firstCollectStepId }: ProjectAdminAppProps) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px'
  return (
    <Suspense fallback={<Loader />}>
      <Providers designSystem admin>
        <ProjectAdminPage projectId={projectId} firstCollectStepId={firstCollectStepId} />
      </Providers>
    </Suspense>
  )
}

export default ProjectAdminApp
