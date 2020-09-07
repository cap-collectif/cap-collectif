// @flow
import * as React from 'react';
import { Container, type Colors } from './GlobalStepItem.style';

export type Props = {|
  title: string,
  subtitle: string,
  description: string,
  colors: Colors,
|};

const GlobalStepItem = ({ title, subtitle, description, colors }: Props) => (
  <Container lineColor={colors.line}>
    <div>
      <span className="title">{title}</span>
      <br />
      <span className="subtitle">{subtitle}</span>
      <span className="line" />
    </div>

    <p className="description">{description}</p>
  </Container>
);

export default GlobalStepItem;
