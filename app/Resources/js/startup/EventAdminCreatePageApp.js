import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import { EventAdminFormCreatePage } from '../components/Event/Admin/Form/EventAdminFormPage';

export default () => (
    <Provider store={ReactOnRails.getStore('appStore')}>
        <IntlProvider>
            <EventAdminFormCreatePage event={null} />
        </IntlProvider>
    </Provider>
);
