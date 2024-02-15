// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import type { Props } from '~/components/Proposal/Admin/ProposalAdminPage'
import type { Props as CreateProps } from '~/components/Proposal/Admin/ProposalAdminCreatePage'
import Loader from '~ui/FeedbacksIndicators/Loader'
import Providers from '~/startup/Providers'

const ProposalAdminPage = lazy(
  () =>
    import(
      /* webpackChunkName: "ProposalAdminPage" */
      '~/components/Proposal/Admin/ProposalAdminPage'
    ),
)
const ProposalAdminCreatePage = lazy(
  () =>
    import(
      /* webpackChunkName: "ProposalAdminCreatePage" */
      '~/components/Proposal/Admin/ProposalAdminCreatePage'
    ),
)
export default (props: Props | CreateProps) => {
  return (
    <Providers>
      <Suspense fallback={<Loader />}>
        {props.proposalId && <ProposalAdminPage {...props} />}
        {props.stepId && <ProposalAdminCreatePage {...props} />}
      </Suspense>
    </Providers>
  )
}
