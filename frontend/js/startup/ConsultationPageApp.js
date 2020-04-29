// @flow
import React from 'react';
import Providers from './Providers';
import ConsultationPropositionBox, {
  type OwnProps as Props,
} from '../components/Consultation/ConsultationPropositionBox';

export default (props: Props) => (
  <Providers>
      <ConsultationPropositionBox {...props} />
    </Providers>
);
