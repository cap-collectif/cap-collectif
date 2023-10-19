// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import type { Props } from '~/components/InteClient/HomeHeader/HomeHeader'
import HomeHeader from '~/components/InteClient/HomeHeader/HomeHeader'

export default (props: Props) => (
  <Providers>
    <HomeHeader {...props} />
  </Providers>
)
