// @flow
import * as React from 'react';
import moment from 'moment';
import Tag from '~/components/Ui/Labels/Tag';
import WrapperDate from './TagDate.style';
import Icon from '~/components/Ui/Icons/Icon';

type TagDateProps = {
  date: string,
  size: string,
};

const TagDate = ({ date, size }: TagDateProps) => {
  const month = moment(date)
    .format('MMM')
    .split('.')
    .join('');
  const day = moment(date).format('DD');
  const hour = moment(date).format('LT');

  return (
    <Tag CustomImage={<Icon name="calendar" size={16} viewBox="0 0 40 40" />} size={size}>
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
