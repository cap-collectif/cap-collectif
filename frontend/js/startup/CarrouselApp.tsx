// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'

const Carrousel = lazy(
  () =>
    import(
      /* webpackChunkName: "Carrousel" */
      '@shared/sections/carrousel/Carrousel'
    ),
)

export default props => (
  <Providers designSystem>
    <Suspense fallback={null}>
      <Carrousel {...props} />
    </Suspense>
  </Providers>
)
