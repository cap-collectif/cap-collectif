// @ts-nocheck
import React from 'react'
import Providers from './Providers'
import type { Props } from '../components/Alert/AlertBox'
import AlertBox from '../components/Alert/AlertBox'

export default ({ children, ...props }: Props) => (
  <Providers>
    <div id="global-alert-box">
      <AlertBox {...props} />
    </div>
    {children}
  </Providers>
)
