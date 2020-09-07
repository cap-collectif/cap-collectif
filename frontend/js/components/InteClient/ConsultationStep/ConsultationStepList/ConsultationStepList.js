// @flow
import * as React from 'react';
import { Container } from './ConsultationStepList.style';
import ConsultationStepItem, {
  type Props as ConsultationItemProps,
} from '../ConsultationStepItem/ConsultationStepItem';

export type Props = {
  steps: Array<ConsultationItemProps>,
  style?: Object,
};

const ConsultationStepList = ({ steps, style }: Props) => (
  <Container style={style}>
    {steps.map((step, idx) => (
      <ConsultationStepItem {...step} key={`consultation-step-${idx}`} />
    ))}
  </Container>
);

export default ConsultationStepList;
