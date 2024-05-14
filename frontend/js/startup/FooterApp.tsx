// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import Footer from '../components/Footer/Footer'

export default (props: Record<string, any>) => (
  <Providers designSystem>
    <Footer {...props} />
  </Providers>
)
