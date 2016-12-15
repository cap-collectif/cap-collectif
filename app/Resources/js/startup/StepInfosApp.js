import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import StepInfos from '../components/Steps/Page/StepInfos';

export default props =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <StepInfos {...props} />
 </Provider>
;
