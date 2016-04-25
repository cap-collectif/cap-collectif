import React from 'react';
import { Provider } from 'react-redux';
import ProjectTrashButton from '../components/Project/ProjectTrashButton';
import ReactOnRails from 'react-on-rails';

export default (props) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <ProjectTrashButton {...props} />
 </Provider>
;
