// @flow
import React from 'react';
import Providers from './Providers';
import ConsultationListBox, { type Props } from '../components/Consultation/ConsultationListBox';

export default (props: Props) => (
  <Providers>
      <ConsultationListBox {...props} />
    </Providers>
);
