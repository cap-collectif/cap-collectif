// @flow
import * as React from 'react';
import Providers from './Providers';
import ImageSlider, { type Props } from '~/components/InteClient/ImageSlider/ImageSlider';

export default (props: Props) => (
  <Providers>
    <ImageSlider {...props} />
  </Providers>
);
