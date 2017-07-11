import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import ProjectsList from '../components/Project/List/ProjectsList';

export default props =>
  <Provider store={ReactOnRails.getStore('appStore')}>
   <ProjectsList {...props} />
  </Provider>
;
