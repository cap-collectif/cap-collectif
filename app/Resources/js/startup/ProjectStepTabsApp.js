import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import ProjectStepTabs from '../components/Project/ProjectStepTabs';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectStepTabs {...props} />
    </IntlProvider>
  </Provider>
);
