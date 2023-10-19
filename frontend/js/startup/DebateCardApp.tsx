// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import DebateCard from '~/components/InteClient/DebateCard/DebateCard'

export default (props: Record<string, any>) => (
  <Providers>
    <DebateCard {...props} />
  </Providers>
)
