// @flow
import * as React from 'react';
import { Container } from './Thumbnail.style';

type Props = {
  image?: string,
  children?: React.Node,
  width?: string,
  height?: string,
};

const Thumbnail = ({ image, children, width, height }: Props) => (
  <Container image={image} width={width} height={height}>
    {children}
  </Container>
);

export default Thumbnail;
