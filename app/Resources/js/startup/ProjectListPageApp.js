import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import ProjectsListPage from '../components/Project/Page/ProjectListPage';

export default props =>
  <Provider store={ReactOnRails.getStore('appStore')}>
    <ProjectsListPage {...props} />
  </Provider>
;
