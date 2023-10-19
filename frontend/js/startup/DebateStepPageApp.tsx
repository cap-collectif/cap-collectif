// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import type { Props } from '~/components/Debate/Page/DebateStepPage'

const DebateStepPage = lazy(
  () =>
    import(
      /* webpackChunkName: "DebateStepPage" */
      '~/components/Debate/Page/DebateStepPage'
    ),
)
export default (props: Props) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px'
  return (
    <Suspense fallback={null}>
      <Providers designSystem resetCSS={false}>
        <DebateStepPage {...props} />
      </Providers>
    </Suspense>
  )
}
