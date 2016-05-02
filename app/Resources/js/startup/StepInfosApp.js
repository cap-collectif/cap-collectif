import React from 'react';
import { Provider } from 'react-redux';
import StepInfos from '../components/Steps/Page/StepInfos';
import ReactOnRails from 'react-on-rails';

export default (props) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <StepInfos {...props} />
 </Provider>
;
