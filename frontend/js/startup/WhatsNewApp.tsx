// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import type { Props } from '~/components/InteClient/WhatsNew/WhatsNew'
import WhatsNew from '~/components/InteClient/WhatsNew/WhatsNew'

export default (props: Props) => (
  <Providers>
    <WhatsNew {...props} />
  </Providers>
)
