// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import { AnalysisProposalsProvider } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.context'
import Loader from '~ui/FeedbacksIndicators/Loader'

const AnalysisIndexPage = lazy(
  () =>
    import(
      /* webpackChunkName: "AnalysisIndexPage" */
      '~/components/Analysis/AnalysisIndexPage/AnalysisIndexPage'
    ),
)

const AnalysisPageApp = () => (
  <Suspense fallback={<Loader />}>
    <Providers designSystem>
      <AnalysisProposalsProvider>
        <AnalysisIndexPage />
      </AnalysisProposalsProvider>
    </Providers>
  </Suspense>
)

export default AnalysisPageApp
