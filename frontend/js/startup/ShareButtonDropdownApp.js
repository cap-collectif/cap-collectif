// @flow
import React from 'react';
import Providers from './Providers';
import ShareButtonDropdownLegacy from '../components/Utils/ShareButtonDropdownLegacy';

type Props = {|
  id: string,
  title: string,
  url: string,
|};

export default (props: Props) => (
  <Providers>
    <ShareButtonDropdownLegacy {...props} />
  </Providers>
);
