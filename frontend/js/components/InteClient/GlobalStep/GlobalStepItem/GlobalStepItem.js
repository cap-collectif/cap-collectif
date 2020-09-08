// @flow
import * as React from 'react';
import { Container, type Colors } from './GlobalStepItem.style';

export type Props = {|
  title: {
    [string]: string,
  },
  subtitle: {
    [string]: string,
  },
  description: {
    [string]: string,
  },
  lang: string,
  colors: Colors,
|};

const GlobalStepItem = ({ title, subtitle, description, lang, colors }: Props) => (
  <Container lineColor={colors.line}>
    <div>
      <span className="title">{title[lang]}</span>
      <br />
      <span className="subtitle">{subtitle[lang]}</span>
      <span className="line" />
    </div>

    <p className="description">{description[lang]}</p>
  </Container>
);

export default GlobalStepItem;
