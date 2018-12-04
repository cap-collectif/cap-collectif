// @flow
import styled from 'styled-components';
import * as React from 'react';
import { BsStyleColors } from '../../../utils/colors';

type Props = {
  bgColor?: 'info' | 'primary' | 'success' | 'warning' | 'danger' | 'default',
  children: React.Node,
};

const Container = styled.div.attrs({
  className: props =>
    props.bsStyle === 'primary'
      ? 'ellipsis card-status custom-primary-bgcolor'
      : 'ellipsis card-status',
})`
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 3px;
  padding: 3px;
  min-height: 25px;
  color: white;
  font-size: 14px;
  text-align: center;
  background-color: ${props => props.bgColor};
`;

export const Status = (props: Props) => {
  const { bgColor, children } = props;

  const getBgColor = BsStyleColors[bgColor];

  return (
    <Container bsStyle={bgColor} bgColor={getBgColor}>
      {children}
    </Container>
  );
};

Status.defaultProps = {
  bgColor: 'default',
};

export default Status;
