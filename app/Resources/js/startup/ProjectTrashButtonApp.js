import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import ProjectTrashButton from '../components/Project/ProjectTrashButton';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectTrashButton {...props} />
    </IntlProvider>
  </Provider>
);
