// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'

const ContactsList = lazy(
  () =>
    import(
      /* webpackChunkName: "ContactsList" */
      '~/components/Contact/ContactsList'
    ),
)
export default () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ContactsList />
    </Providers>
  </Suspense>
)
