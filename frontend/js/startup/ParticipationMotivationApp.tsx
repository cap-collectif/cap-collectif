// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import type { Props } from '~/components/InteClient/ParticipationMotivation/ParticipationMotivation'
import ParticipationMotivation from '~/components/InteClient/ParticipationMotivation/ParticipationMotivation'

export default (props: Props) => (
  <Providers>
    <ParticipationMotivation {...props} />
  </Providers>
)
