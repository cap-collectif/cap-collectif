// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'
import type { Uuid } from '~/types'

const ProposalNewsHeaderButtons = lazy(
  () =>
    import(
      /* webpackChunkName: "ProposalNewsHeaderButtons" */
      '~/components/Proposal/Page/Blog/ProposalNewsHeaderButtons'
    ),
)
type Props = {
  postId: Uuid
}
export default (props: Props) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px'
  return (
    <Suspense fallback={<Loader />}>
      <Providers designSystem resetCSS={false}>
        <ProposalNewsHeaderButtons {...props} />
      </Providers>
    </Suspense>
  )
}
