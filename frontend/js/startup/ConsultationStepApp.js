// @flow
import * as React from 'react';
import Providers from './Providers';
import ConsultationStepList, {
  type Props,
} from '~/components/InteClient/ConsultationStep/ConsultationStepList/ConsultationStepList';

export default (props: Props) => (
  <Providers>
    <ConsultationStepList {...props} />
  </Providers>
);
