// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import CookieContent from '../components/StaticPage/CookieContent'

export default (props: Record<string, any>) => (
  <Providers>
    <CookieContent {...props} />
  </Providers>
)
