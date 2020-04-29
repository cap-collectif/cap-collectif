// @flow
import React from 'react';
import Providers from './Providers';
import CarouselContainer, { type Props } from '../components/Carousel/CarouselContainer';

export default (props: Props) => (
  <Providers>
      <CarouselContainer {...props} />
    </Providers>
);
