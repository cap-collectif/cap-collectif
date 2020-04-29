// @flow
import React from 'react';
import Providers from './Providers';
import ReplyPage, { type Props } from '../components/Reply/Profile/ReplyPage';

export default (props: Props) => (
  <Providers>
    <ReplyPage {...props} />
  </Providers>
);
