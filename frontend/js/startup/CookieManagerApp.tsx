// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import CookieManagerModal from '../components/StaticPage/CookieManagerModal'

export default (props: Record<string, any>) => (
  <Providers>
    <CookieManagerModal {...props} />
  </Providers>
)
