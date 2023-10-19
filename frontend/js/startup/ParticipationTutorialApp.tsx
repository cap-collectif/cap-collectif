// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import type { Props } from '~/components/InteClient/ParticipationTutorial/ParticipationTutorial'
import ParticipationTutorial from '~/components/InteClient/ParticipationTutorial/ParticipationTutorial'

export default (props: Props) => (
  <Providers>
    <ParticipationTutorial {...props} />
  </Providers>
)
