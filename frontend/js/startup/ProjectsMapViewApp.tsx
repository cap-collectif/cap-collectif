// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Loader from '~/components/Ui/FeedbacksIndicators/Loader'
import Providers from './Providers'
import { Flex, Skeleton } from '@cap-collectif/ui'

const ProjectsMapView = lazy(
  () =>
    import(
      /* webpackChunkName: "ProjectsMapView" */
      '~/components/Project/Map/ProjectsMapView'
    ),
)

const Fallback = () => (
  <section id="projectsMap" className="section--custom">
    <div className="container">
      <div className="row">
        <Flex direction="column" bg="white" p={3}>
          <Flex justifyContent="space-between" alignItems="center">
            <Skeleton.Text size="lg" width="25%" />
          </Flex>
          <Flex justifyContent="center" alignItems="center" my="100px">
            <Loader />
          </Flex>
          <Flex justifyContent="end">
            <Skeleton.Text size="lg" width={8} />
          </Flex>
        </Flex>
      </div>
    </div>
  </section>
)

export default () => (
  <Providers designSystem>
    <style>{'.cap-link:before {display:none;}'}</style>
    <Suspense fallback={<Fallback />}>
      <ProjectsMapView />
    </Suspense>
  </Providers>
)
