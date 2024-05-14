// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import type { Props } from '~/components/Project/Page/ProjectListPage'
import Loader from '~ui/FeedbacksIndicators/Loader'

const ProjectsListPage = lazy(
  () =>
    import(
      /* webpackChunkName: "ProjectsListPage" */
      '~/components/Project/Page/ProjectListPage'
    ),
)
export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers designSystem>
      <ProjectsListPage {...props} />
    </Providers>
  </Suspense>
)
