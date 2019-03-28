// @flow
import * as React from 'react';
import styled from 'styled-components';
import { darken } from 'polished';

type Props = {
  backgroundColor: string,
  children: React.Node,
  className: string,
  darkness?: number,
};

const BoxContainer = styled.div`
  padding: 15px;
  background-color: ${props =>
    props.darkness > 0 ? darken(props.darkness, props.backgroundColor) : props.backgroundColor};
  border-radius: 4px;
`;

export const ColorBox = (props: Props) => {
  const { backgroundColor, children, className, darkness } = props;

  return (
    <BoxContainer darkness={darkness} className={className} backgroundColor={backgroundColor}>
      {children}
    </BoxContainer>
  );
};

ColorBox.defaultProps = {
  darkness: 0,
};

export default ColorBox;
