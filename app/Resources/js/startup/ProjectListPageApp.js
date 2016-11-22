import React from 'react';
import { Provider } from 'react-redux';
import ProjectsListPage from '../components/Project/Page/ProjectListPage';
import ReactOnRails from 'react-on-rails';

export default (props) =>
  <Provider store={ReactOnRails.getStore('appStore')}>
    <ProjectsListPage {...props} />
  </Provider>
;
