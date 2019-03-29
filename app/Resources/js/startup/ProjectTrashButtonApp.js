// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ProjectTrashButton, { type Props } from '../components/Project/ProjectTrashButton';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectTrashButton {...props} />
    </IntlProvider>
  </Provider>
);
