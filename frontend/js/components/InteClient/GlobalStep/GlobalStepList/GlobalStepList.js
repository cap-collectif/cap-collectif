// @flow
import * as React from 'react';
import { Container } from './GlobalStepList.style';
import GlobalStepItem, { type Props as GlobalItemProps } from '../GlobalStepItem/GlobalStepItem';

export type Props = {
  steps: Array<GlobalItemProps>,
  style?: Object,
};

const GlobalStepList = ({ steps, style }: Props) => (
  <Container style={style}>
    {steps.map((step, idx) => (
      <GlobalStepItem {...step} key={`global-step-${idx}`} />
    ))}
  </Container>
);

export default GlobalStepList;
