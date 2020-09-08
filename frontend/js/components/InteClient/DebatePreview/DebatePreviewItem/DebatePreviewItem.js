// @flow
import * as React from 'react';
import { Container } from './DebatePreviewItem.style';

export type Props = {|
  title: {
    [string]: string,
  },
  img: string,
  lang: string,
|};

const DebatePreviewItem = ({ title, img, lang }: Props) => (
  <Container>
    <img src={img} alt="" />
    <p>{title[lang]}</p>
  </Container>
);

export default DebatePreviewItem;
