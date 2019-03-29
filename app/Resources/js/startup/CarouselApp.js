// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import CarouselContainer, { type Props } from '../components/Carousel/CarouselContainer';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <CarouselContainer {...props} />
    </IntlProvider>
  </Provider>
);
