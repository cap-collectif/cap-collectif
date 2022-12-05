// @flow
import * as React from 'react';
import Providers from './Providers';
import DistrictPage, { type Props } from '~/components/District/DistrictPage';

export default (props: Props) => (
  <Providers>
    <React.Suspense fallback={null}>
      <DistrictPage {...props} />
    </React.Suspense>
  </Providers>
);
