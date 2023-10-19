// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import type { Props } from '~/components/InteClient/GlobalStep/GlobalStepList/GlobalStepList'
import GlobalStepList from '~/components/InteClient/GlobalStep/GlobalStepList/GlobalStepList'

export default (props: Props) => (
  <Providers>
    <GlobalStepList {...props} />
  </Providers>
)
