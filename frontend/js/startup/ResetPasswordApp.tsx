// @ts-nocheck
import React from 'react'
import Providers from './Providers'
import type { Props } from '~/components/User/ResetPasswordForm'
import ResetPasswordForm from '~/components/User/ResetPasswordForm'

export default (props: Props) => (
  <Providers>
    <ResetPasswordForm {...props} />
  </Providers>
)
