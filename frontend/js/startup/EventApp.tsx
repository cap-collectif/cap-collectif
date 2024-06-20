// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'

const EventListPage = lazy(
  () =>
    import(
      /* webpackChunkName: "EventListPage" */
      '~/components/Event/EventListPage'
    ),
)
export default (props: Record<string, any>) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px'
  return (
    <Suspense fallback={<Loader />}>
      <Providers designSystem>
        <EventListPage {...props} />
      </Providers>
    </Suspense>
  )
}
