import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import CarouselContainer from '../components/Carousel/CarouselContainer';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <CarouselContainer {...props} />
    </IntlProvider>
  </Provider>
);
