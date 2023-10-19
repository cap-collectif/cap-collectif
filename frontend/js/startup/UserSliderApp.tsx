// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import type { Props } from '~/components/InteClient/UserSlider/UserSlider'
import UserSlider from '~/components/InteClient/UserSlider/UserSlider'

export default (props: Props) => (
  <Providers>
    <UserSlider {...props} />
  </Providers>
)
