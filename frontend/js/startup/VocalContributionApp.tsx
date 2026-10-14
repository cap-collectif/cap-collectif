import * as React from 'react'
import Providers from './Providers'
import VocalContribution, { Props } from '~/components/VocalContribution/VocalContribution'

export default (props: Props) => (
  <Providers designSystem>
    <VocalContribution {...props} />
  </Providers>
)
