// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import type { Props } from '~/components/ProposalForm/ProposalFormAdminPage'
import AlertBoxApp from '~/startup/AlertBoxApp'
import Loader from '~ui/FeedbacksIndicators/Loader'

const ProposalFormAdminPage = lazy(
  () =>
    import(
      /* webpackChunkName: "ProposalFormAdminPage" */
      '~/components/ProposalForm/ProposalFormAdminPage'
    ),
)
export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <AlertBoxApp />
      <ProposalFormAdminPage {...props} />
    </Providers>
  </Suspense>
)
