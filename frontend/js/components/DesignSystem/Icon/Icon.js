// @flow
import * as React from 'react';
import cn from 'classnames';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import * as Icons from './index';
import AppBox from '~ui/Primitives/AppBox';
import { SPACES_SCALES } from '~/styles/theme/base';

export const ICON_NAME = {
  TRASH: 'TRASH',
  PENCIL: 'PENCIL',
  INFO: 'INFO',
  USER: 'USER',
  CLOCKO: 'CLOCKO',
  CLOCK: 'CLOCK',
  CALENDARO: 'CALENDARO',
  CALENDAR: 'CALENDAR',
  ARROWLEFTO: 'ARROWLEFTO',
  ARROWRIGHTO: 'ARROWRIGHTO',
  ARROWDOWNO: 'ARROWDOWNO',
  ARROWUPO: 'ARROWUPO',
  ARROWLEFT: 'ARROWLEFT',
  ARROWRIGHT: 'ARROWRIGHT',
  ARROWDOWN: 'ARROWDOWN',
  ARROWUP: 'ARROWUP',
  ADD: 'ADD',
  CROSS: 'CROSS',
};

export const ICON_SIZE = {
  XS: SPACES_SCALES[3], // 12px
  S: SPACES_SCALES[4], // 16px
  M: SPACES_SCALES[6], // 24px
  L: SPACES_SCALES[8], // 32px
  XL: SPACES_SCALES[10], // 48px
};

type Props = {|
  ...AppBoxProps,
  name: $Values<typeof ICON_NAME>,
  className?: string,
  color?: string,
  size?: $Values<typeof ICON_SIZE>,
|};

const Icon = React.forwardRef<Props, HTMLElement>(
  ({ name, size = ICON_SIZE.M, color = 'black', className, ...props }: Props, ref) => {
    const IconSvg = Icons[name];

    return (
      <AppBox
        as={IconSvg}
        width={size}
        height={size}
        className={cn('icon', className)}
        color={color}
        ref={ref}
        {...props}
      />
    );
  },
);

Icon.displayName = 'Icon';

export default Icon;
