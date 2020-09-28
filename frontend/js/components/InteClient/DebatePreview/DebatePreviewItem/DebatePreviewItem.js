// @flow
import * as React from 'react';
import { Container, ImageContainer } from './DebatePreviewItem.style';

export type Props = {|
  title: {
    [string]: string,
  },
  img: string,
  link: {
    [string]: string,
  },
  buttonText: {
    [string]: string,
  },
  lang: string,
|};

const DebatePreviewItem = ({ title, img, link, lang, buttonText }: Props) => (
  <Container href={link[lang]}>
    <ImageContainer img={img}>
      <button type="button">{buttonText[lang]}</button>
      <div className="overlay" />
    </ImageContainer>
    <p>{title[lang]}</p>
  </Container>
);

export default DebatePreviewItem;
