// @flow
import * as React from 'react';
import styled from 'styled-components';

type Props = {
  url: string,
  width: string,
  height: string
};

export const Container = styled.div`
  background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0)), url(${props => props.url});
  background-size:cover;
  background-repeat:no-repeat;
  width: ${props => props.width};
  height: ${props => props.height};
`;

export default class DarkenGradientMedia extends React.Component<Props> {

  render() {
    const { url, width, height } = this.props;

    return (
      <Container url={url} width={width} height={height} />
    );

  }
}
