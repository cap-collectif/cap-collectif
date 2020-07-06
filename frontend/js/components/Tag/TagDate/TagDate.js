// @flow
import * as React from 'react';
import moment from 'moment';
import Tag from '~/components/Ui/Labels/Tag';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import IconRounded from '~ui/Icons/IconRounded';

type Props = {
  date: string,
  size: string,
};

const TagDate = ({ date, size }: Props) => (
  <Tag size={size}>
    <IconRounded size={18} color={colors.darkGray}>
      <Icon name={ICON_NAME.calendar} color="#fff" size={10} />
    </IconRounded>

    {moment(date).format('MMMM Do YYYY, h:mm:ss a')}
  </Tag>
);

export default TagDate;
