// @flow
import * as React from 'react';
import { Container, type Position } from './Fixed.style';

type Props = {
  position: Position,
  children: React.Node,
  show?: boolean,
  width?: string,
  className?: string,
  zIndex?: number,
};

const Fixed = ({ position, children, show = true, width = 'auto', className, zIndex }: Props) =>
  show ? (
    <Container position={position} width={width} className={className} zIndex={zIndex}>
      {children}
    </Container>
  ) : null;

export default Fixed;
