// @flow
import * as React from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import moment from 'moment';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import IconRounded from '~ui/Icons/IconRounded';

type Props = {
  date: string,
  children?: React.Node,
};

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'card__date',
})`
  display: flex;
  flex-direction: row;
  align-items: center;

  .date {
    margin: 0 8px;
  }
`;

const Date = ({ date, children }: Props) => {
  const isToday = moment(date).isSame(moment(), 'day');
  return (
    <Container>
      <IconRounded size={18} color={colors.darkGray}>
        <Icon name={ICON_NAME.calendar} size={10} color="#fff" />
      </IconRounded>
      <span className="date">
        {isToday ? (
          <FormattedMessage id="today" />
        ) : (
          <FormattedDate
            value={moment(date)}
            day="numeric"
            month="long"
            year="numeric"
            hour="numeric"
            minute="numeric"
          />
        )}
      </span>
      {children}
    </Container>
  );
};

export default Date;
