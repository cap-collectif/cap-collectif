import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ProjectTrashComment from '../components/Project/ProjectTrashComment';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectTrashComment {...props} />
    </IntlProvider>
  </Provider>
);
