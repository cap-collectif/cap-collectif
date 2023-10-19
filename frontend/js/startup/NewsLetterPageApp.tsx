// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import NewsLetterInput from '~/components/Newsletter/NewsLetterInput'

export default () => (
  <Providers>
    <React.Suspense fallback={null}>
      <NewsLetterInput />
    </React.Suspense>
  </Providers>
)
