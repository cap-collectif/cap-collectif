// @flow
import * as React from 'react';
import Providers from './Providers';
import Sidebar, { type Props } from '~/components/Admin/Sidebar/Sidebar';

const SidebarApp = (props: Props) => (
  <Providers>
    <Sidebar {...props} />
  </Providers>
);

export default SidebarApp;
