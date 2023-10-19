// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import type { Props } from '~/components/InteClient/ConsultationStep/ConsultationStepList/ConsultationStepList'
import ConsultationStepList from '~/components/InteClient/ConsultationStep/ConsultationStepList/ConsultationStepList'

export default (props: Props) => (
  <Providers>
    <ConsultationStepList {...props} />
  </Providers>
)
