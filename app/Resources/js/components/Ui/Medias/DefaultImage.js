// @flow
import * as React from 'react';
import styled from 'styled-components';
import colors from '../../../utils/colors';

type Props = {
  children: React.Node,
  width: string,
  height: string,
};

export const Container = styled.div.attrs({
  className: 'default-image',
})`
  width: ${props => props.width};
  height: ${props => props.height};
  display: flex;
  background-color: ${colors.primaryColor};

  svg {
    margin: auto;
    padding: 20px;
  }
`;

export class DefaultImage extends React.Component<Props> {
  static defaultProps = {
    width: '100%',
    height: '100%',
  };

  render() {
    const { width, height, children } = this.props;

    return (
      <Container width={width} height={height}>
        {children}
      </Container>
    );
  }
}

export default DefaultImage;
