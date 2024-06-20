// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'

const Shield = lazy(
  () =>
    import(
      /* webpackChunkName: "Shield" */
      '~/components/Page/ShieldPage'
    ),
)
export default (props: { chartBody: string | null | undefined }) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px'
  return (
    <Suspense fallback={<Loader />}>
      <Providers designSystem>
        <Shield {...props} />
      </Providers>
    </Suspense>
  )
}
