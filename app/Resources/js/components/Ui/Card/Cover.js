// @flow
import styled from 'styled-components';
import * as React from 'react';

type Props = {
  height?: string,
  width?: string,
  children: React.Node,
};

const Container = styled.div.attrs({
  className: 'card-cover',
})`
  overflow: hidden;
  height: ${props => props.height};
  width: ${props => props.width};

  img {
    width: 100%;
    object-fit: cover;
    height: 100%;
  }
`;

export const Cover = (props: Props) => {
  const { width, height, children } = props;

  return (
    <Container width={width} height={height}>
      {children}
    </Container>
  );
};

Cover.defaultProps = {
  height: '175px',
  width: 'auto',
};

export default Cover;
