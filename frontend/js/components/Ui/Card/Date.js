// @flow
import * as React from 'react';
import styled, { type StyledComponent, css } from 'styled-components';
import moment from 'moment';
import colors from '~/utils/colors';

type Props = {
  date: string,
  isInline?: boolean,
};

export const Container: StyledComponent<
  { isInline?: boolean },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'card__date',
})`
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
  font-size: 18px;

  span {
    margin-right: 5px;
  }

  .card__date__month {
    color: ${colors.primaryColor};
    font-weight: 600;
    margin-bottom: 10px;
    order: 1;
    text-transform: capitalize;
  }

  .card__date__day {
    color: ${colors.darkGray};
    order: 2;
  }

  .card__date__hour {
    order: 3;
  }

  ${props =>
    props.isInline &&
    css`
      margin: 5px 0;
      flex-direction: row;
      color: ${colors.darkText};
      font-weight: 600;

      .card__date__month {
        order: 2;
        margin-bottom: 0;
        color: inherit;
        font-weight: inherit;
        text-transform: uppercase;
      }

      .card__date__day {
        order: 1;
        color: inherit;
      }
    `}
`;

const Date = ({ date, isInline = false }: Props) => {
  const month = moment(date)
    .format('MMM')
    .split('.')
    .join('');

  const day = moment(date).format('DD');
  const hour = moment(date).format('LT');

  return (
    <Container isInline={isInline}>
      <span className="card__date__month">{month}</span>
      <span className="card__date__day">{day}</span>
      {isInline && <span className="card__date__hour">· {hour}</span>}
    </Container>
  );
};

export default Date;
