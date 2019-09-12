// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ConsultationListBox, {
  type Props
} from '../components/Consultation/ConsultationListBox';


export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider timeZone={window.timeZone}>
      <ConsultationListBox {...props} />
    </IntlProvider>
  </Provider>
);
