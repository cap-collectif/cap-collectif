// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import moment from 'moment';
import colors from '~/utils/colors';

type Props = {
  date: string,
  hasHour?: boolean,
};

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
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
`;

const Date = ({ date, hasHour }: Props) => {
  const month = moment(date).format('MMM');
  const day = moment(date).format('DD');
  const hour = moment(date).format('LT');

  return (
    <Container>
      <span className="card__date__month">{month}</span>
      <span className="card__date__day">{day}</span>
      {hasHour && <span className="card__date__hour">· {hour}</span>}
    </Container>
  );
};

export default Date;
