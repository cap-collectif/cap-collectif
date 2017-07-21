import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import StepInfos from '../components/Steps/Page/StepInfos';
import ConsultationPropositionBox
  from '../components/Consultation/ConsultationPropositionBox';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <div>
      <StepInfos {...props} />
      <ConsultationPropositionBox {...props} />
    </div>
  </Provider>
);
