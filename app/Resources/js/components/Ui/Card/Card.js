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
import { Header } from './Header';

type Props = {
  children?: any,
  className?: string,
  style?: Object,
  id?: string,
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

  button:not(.ql-editor-button) {
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
  static Type = Type;

  static Header = Header;

  static Cover = Cover;

  static Body = Body;

  static Title = Title;

  static Counters = Counters;

  static Status = Status;

  render() {
    const { children, className, style, id } = this.props;

    return (
      <Container className={className} style={style} id={id}>
        {children}
      </Container>
    );
  }
}

export default Card;
