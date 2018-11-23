import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ProjectStatsPage from '../components/Project/Stats/ProjectStatsPage';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectStatsPage {...props} />
    </IntlProvider>
  </Provider>
);
