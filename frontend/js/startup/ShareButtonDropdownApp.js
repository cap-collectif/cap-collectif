// @flow
import React from 'react';
import Providers from './Providers';
import ShareButtonDropdown from '../components/Utils/ShareButtonDropdown';

type Props = {|
  id: string,
  title: string,
  url: string,
|};

export default (props: Props) => (
  <Providers>
    <ShareButtonDropdown {...props} />
  </Providers>
);
