import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import ProjectStatsPage from '../components/Project/Stats/ProjectStatsPage';

export default props =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <ProjectStatsPage {...props} />
 </Provider>
;
