// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'
import type { Props } from '~/components/Admin/Emailing/MailParameter/MailParameterQuery'

const MailParameterQuery = lazy(
  () =>
    import(
      /* webpackChunkName: "MailParameterQuery" */
      '~/components/Admin/Emailing/MailParameter/MailParameterQuery'
    ),
)
export default ({ id }: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <MailParameterQuery id={id} />
    </Providers>
  </Suspense>
)
