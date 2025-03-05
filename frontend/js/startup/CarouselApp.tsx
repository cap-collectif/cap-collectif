// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import type { Props } from '~/components/Carousel/CarouselContainer'
import Loader from '~ui/FeedbacksIndicators/Loader'

const CarouselContainer = lazy(
  () =>
    import(
      /* webpackChunkName: "CarouselContainer" */
      '~/components/Carousel/CarouselContainer'
    ),
)
export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <CarouselContainer {...props} />
    </Providers>
  </Suspense>
)
