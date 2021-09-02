// @flow
import React from 'react';
import Providers from './Providers';
import ResetPasswordForm, { type Props } from '~/components/User/ResetPasswordForm';

export default (props: Props) => (
  <Providers>
    <ResetPasswordForm {...props} />
  </Providers>
);
