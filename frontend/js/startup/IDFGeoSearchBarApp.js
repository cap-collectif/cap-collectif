// @flow
import React from 'react';
import Providers from './Providers';
import GeoSearchBar from '~ds/GeoSearchBar/GeoSearchBar';

type Props = {|
  baseUrl: string,
|};

export default (props: Props) => {
  return (
    <Providers designSystem resetCSS>
      <GeoSearchBar baseUrl={props.baseUrl} />
    </Providers>
  );
};
