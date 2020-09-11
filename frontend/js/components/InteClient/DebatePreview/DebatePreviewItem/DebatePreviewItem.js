// @flow
import * as React from 'react';
import { Container } from './DebatePreviewItem.style';

export type Props = {|
  title: {
    [string]: string,
  },
  img: string,
  link: {
    [string]: string,
  },
  lang: string,
|};

const DebatePreviewItem = ({ title, img, link, lang }: Props) => (
  <Container href={link[lang]}>
    <img src={img} alt="" />
    <p>{title[lang]}</p>
  </Container>
);

export default DebatePreviewItem;
