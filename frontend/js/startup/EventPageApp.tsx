// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'

const EventPage = lazy(
  () =>
    import(
      /* webpackChunkName: "EventPage" */
      '~/components/Event/EventPage/EventPage'
    ),
)
type Props = {
  userId?: string
  isDeleted?: boolean | null | undefined
  isAuthenticated?: boolean
}
export default (props: Props) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px'
  return (
    <Suspense fallback={null}>
      <Providers designSystem resetCSS={false}>
        <EventPage {...props} />
      </Providers>
    </Suspense>
  )
}
