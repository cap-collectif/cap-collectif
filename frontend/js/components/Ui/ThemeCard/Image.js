// @flow
import React from 'react';
import styled, { type StyledComponent } from 'styled-components';
// eslint-disable-next-line import/no-named-default
import { default as StyledImage } from '~ui/Primitives/Image';

type Props = {|
  src: string,
  alt: string,
|};

const ImageContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 248px;
  height: 220px;

  @media (max-width: 768px) {
    width: 100%;
  }
  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const Image = ({ src, alt }: Props) => {
  return (
    <ImageContainer>
      <StyledImage src={src} alt={alt} />
    </ImageContainer>
  );
};
export default Image;
