// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'

const ProjectDistrictAdmin = lazy(
  () =>
    import(
      /* webpackChunkName: "ProjectDistrictAdmin" */
      '~/components/ProjectDistrict/ProjectDistrictAdmin'
    ),
)
type Props = {}
export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ProjectDistrictAdmin {...props} />
    </Providers>
  </Suspense>
)
