// @flow
import * as React from 'react';
import { Container } from './ConsultationStepList.style';
import ConsultationStepItem, {
  type Props as ConsultationItemProps,
} from '../ConsultationStepItem/ConsultationStepItem';

export type Props = {
  steps: Array<ConsultationItemProps>,
  lang: string,
  style?: Object,
};

const ConsultationStepList = ({ steps, lang, style }: Props) => (
  <Container style={style}>
    {steps.map((step, idx) => (
      <ConsultationStepItem {...step} key={`consultation-step-${idx}`} lang={lang} />
    ))}
  </Container>
);

export default ConsultationStepList;
