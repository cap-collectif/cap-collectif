// @flow
import React from 'react';
import Providers from './Providers';
import ProjectDistrictAdmin from '~/components/ProjectDistrict/ProjectDistrictAdmin';

type Props = {};

export default (props: Props) => (
  <Providers>
    <ProjectDistrictAdmin {...props} />
  </Providers>
);
