// @flow
import React from 'react';
import styled, { type StyledComponent } from 'styled-components';

type Props = {|
  src: string,
  alt: string,
|};
const ImageContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 240px;
  margin-left: 5px;

  @media (max-width: 768px) {
    width: 100%;
    margin-left: 0;
  }
  img {
    width: 100%;
  }
`;

export const Image = ({ src, alt }: Props) => (
  <ImageContainer>
    <img src={src} alt={alt} />
  </ImageContainer>
);

export default Image;
