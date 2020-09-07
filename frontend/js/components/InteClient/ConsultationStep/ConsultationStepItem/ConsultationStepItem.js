// @flow
import * as React from 'react';
import { Container, Number, type Colors } from './ConsultationStepItem.style';

export type Props = {|
  number: string,
  date: string,
  title: string,
  colors: Colors,
|};

const ConsultationStepItem = ({ number, date, title, colors }: Props) => (
  <Container>
    <Number colors={colors}>
      {number}

      <span className="line" />
    </Number>

    <div>
      <p className="title">{title}</p>
      <p className="date">{date}</p>
    </div>
  </Container>
);

export default ConsultationStepItem;
