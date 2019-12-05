// @flow
import * as React from 'react';
import moment from 'moment';
import Tag from '~/components/Ui/Labels/Tag';
import WrapperDate from './TagDate.style';

type TagDateProps = {
  date: string,
  size: string,
};

const TagDate = ({ date, size }: TagDateProps) => {
  const month = moment(date).format('MMM');
  const day = moment(date).format('DD');
  const hour = moment(date).format('LT');

  return (
    <Tag icon="cap-calendar-2" size={size}>
      <WrapperDate>
        <span>{day}</span>
        <span>{month}</span>
        <span>•</span>
        <span>{hour}</span>
      </WrapperDate>
    </Tag>
  );
};

export default TagDate;
