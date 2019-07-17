// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ProjectsListPage from '../components/Project/Page/ProjectListPage';

type Props = {
  limit?: ?number,
};

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectsListPage {...props} />
    </IntlProvider>
  </Provider>
);
