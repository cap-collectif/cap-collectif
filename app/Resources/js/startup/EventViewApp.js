// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import EventViewPage from '../components/Event/EventViewPage';

export default (props: Object) => (
    <Provider store={ReactOnRails.getStore('appStore')}>
        <IntlProvider>
            <EventViewPage {...props} />
        </IntlProvider>
    </Provider>
);
