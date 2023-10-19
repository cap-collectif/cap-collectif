// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import CookieModal from '../components/StaticPage/CookieModal'

export default (props: Record<string, any>) => (
  <Providers>
    <CookieModal {...props} />
  </Providers>
)
