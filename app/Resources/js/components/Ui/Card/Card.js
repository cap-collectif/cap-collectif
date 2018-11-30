// @flow
import styled from 'styled-components';
import React from 'react';
import colors from '../../../utils/colors';
import Cover from './Cover';
import Type from './Type';
import Status from './Status';
import Body from './Body';
import Title from './Title';

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

    a {
      color: ${colors.darkGray};
    }
  }

  .card__threshold .progress {
    margin-bottom: 0;
  }

  button {
    margin-top: 15px;
  }

  .ql-toolbar button {
    margin-top: 0;
  }

  .card__actions {
    color: ${colors.darkGray};
    font-size: 14px;

    a {
      text-transform: uppercase;
      margin-right: 10px;
    }
  }

  .card__counters {
    padding: 5px;
    background-color: ${colors.pageBgc};
    border-top: 1px solid ${colors.borderColor};
    font-size: 14px;
    text-align: center;

    &_multiple .card__counter {
      width: 50%;

      &:nth-child(2) {
        border-left: 1px solid ${colors.borderColor};
      }
    }

    .card__counter {
      display: inline-block;

      &__value {
        font-size: 18px;
      }
    }
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

  render() {
    const { children } = this.props;

    return <Container>{children}</Container>;
  }
}

export default Card;
