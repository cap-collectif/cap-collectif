// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import Calendar from '~/components/InteClient/Calendar/Calendar'

export default (props: Record<string, any>) => (
  <Providers>
    <Calendar {...props} />
  </Providers>
)
