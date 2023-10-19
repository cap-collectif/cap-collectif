// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import type { Props } from '~/components/LanguageButton/LanguageRedirectButton'
import LanguageRedirectButton from '~/components/LanguageButton/LanguageRedirectButton'

export default (props: Props) => (
  <Providers>
    <LanguageRedirectButton {...props} />
  </Providers>
)
