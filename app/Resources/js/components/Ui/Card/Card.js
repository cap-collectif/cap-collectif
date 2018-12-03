// @flow
import styled from 'styled-components';
import React from 'react';
import colors from '../../../utils/colors';
import Cover from './Cover';
import Type from './Type';
import Status from './Status';
import Body from './Body';
import Title from './Title';
import Counters from './Counters';

type Props = {
  children?: any,
};

export const Container = styled.div.attrs({
  className: 'card',
})`
  border: 1px solid ${colors.borderColor};
  background-color: ${colors.white};
  margin-bottom: 30px;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  width: 100%;
  border-radius: 4px;

  ul {
    margin-bottom: 5px;
  }

  button {
    margin-top: 15px;
  }

  @media print {
    border: none;
    display: block;
    margin-bottom: 0;
    margin-top: 15pt;
  }
`;

export class Card extends React.PureComponent<Props> {
  static Cover = Cover;

  static Type = Type;

  static Status = Status;

  static Body = Body;

  static Title = Title;

  static Counters = Counters;

  render() {
    const { children } = this.props;

    return <Container>{children}</Container>;
  }
}

export default Card;
