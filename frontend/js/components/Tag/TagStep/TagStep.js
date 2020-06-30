// @flow
import * as React from 'react';
import IconRounded from '~ui/Icons/IconRounded';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import Tag from '~ui/Labels/Tag';

type Props = {
  step: {
    title: string,
  },
  size: string,
};

const TagStep = ({ step, size }: Props) => (
  <Tag size={size}>
    <IconRounded size={18} color={colors.darkGray}>
      <Icon name={ICON_NAME.step} color="#fff" size={10} />
    </IconRounded>
    {step.title}
  </Tag>
);

export default TagStep;
