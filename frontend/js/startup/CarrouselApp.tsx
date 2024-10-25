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

export default () => (
  <Providers designSystem>
    <Suspense fallback={null}>
      <Carrousel />
    </Suspense>
  </Providers>
)
