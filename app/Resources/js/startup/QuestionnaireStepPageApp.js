import React from 'react';
import { Provider } from 'react-redux';
import QuestionnaireStepPage from '../components/Page/QuestionnaireStepPage';
import ReactOnRails from 'react-on-rails';

export default (props) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <QuestionnaireStepPage {...props} />
 </Provider>
;
