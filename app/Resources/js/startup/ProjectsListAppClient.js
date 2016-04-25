import React from 'react';
import { Provider } from 'react-redux';
import ProjectsList from '../components/Project/List/ProjectsList';
import ReactOnRails from 'react-on-rails';

export default (props) =>
  <Provider store={ReactOnRails.getStore('appStore')}>
   <ProjectsList {...props} />
  </Provider>
;
