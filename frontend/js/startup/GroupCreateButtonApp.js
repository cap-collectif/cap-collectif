// @flow
import React from 'react';
import Providers from './Providers';
import GroupCreateButton, { type Props } from '../components/Group/GroupCreateButton';

export default (props: Props) => (
  <Providers>
      <GroupCreateButton {...props} />
    </Providers>
);
