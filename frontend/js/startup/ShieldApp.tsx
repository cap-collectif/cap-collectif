// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'
import { ChartModalQuery } from '@shared/register/ChartModal'

const Shield = lazy(
  () =>
    import(
      /* webpackChunkName: "Shield" */
      '@shared/shield/ShieldPage'
    ),
)
export default (props: { chartBody: string | null | undefined }) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px'
  return (
    <Suspense fallback={<Loader />}>
      <Providers designSystem>
        <Shield {...props} />
        <ChartModalQuery />
      </Providers>
    </Suspense>
  )
}
