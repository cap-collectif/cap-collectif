// @flow
import * as React from 'react';
import cn from 'classnames';
import styled, { type StyledComponent } from 'styled-components';
import { variant } from 'styled-system';
import type { AppBoxProps, Responsive } from '~ui/Primitives/AppBox.type';
import * as Icons from './index';
import AppBox from '~ui/Primitives/AppBox';

export const ICON_NAME = {
  TRASH: 'TRASH',
  PENCIL: 'PENCIL',
  USER: 'USER',
  CLOCK_O: 'CLOCK_O',
  CLOCK: 'CLOCK',
  CALENDAR_O: 'CALENDAR_O',
  CALENDAR: 'CALENDAR',
  ARROW_LEFT_O: 'ARROW_LEFT_O',
  ARROW_RIGHT_O: 'ARROW_RIGHT_O',
  ARROW_DOWN_O: 'ARROW_DOWN_O',
  ARROW_UP_O: 'ARROW_UP_O',
  ARROW_LEFT: 'ARROW_LEFT',
  ARROW_RIGHT: 'ARROW_RIGHT',
  ARROW_DOWN: 'ARROW_DOWN',
  ARROW_UP: 'ARROW_UP',
  ADD: 'ADD',
  CROSS: 'CROSS',
  CIRCLE_INFO: 'CIRCLE_INFO',
  CIRCLE_ALERT: 'CIRCLE_ALERT',
  CIRCLE_CHECK: 'CIRCLE_CHECK',
  CIRCLE_CROSS: 'CIRCLE_CROSS',
  NEWSPAPER: 'NEWSPAPER',
  SPINNER: 'SPINNER',
  BELL: 'BELL',
  THUMB_UP: 'THUMB_UP',
  THUMB_DOWN: 'THUMB_DOWN',
  LONG_ARROW_LEFT: 'LONG_ARROW_LEFT',
  LONG_ARROW_RIGHT: 'LONG_ARROW_RIGHT',
  FLAG: 'FLAG',
  MORE: 'MORE',
  MODERATE: 'MODERATE',
  HYPERLINK: 'HYPERLINK',
  CLAP_O: 'CLAP_O',
  CLAP: 'CLAP',
};

export const ICON_SIZE = {
  XS: 'xs', // 12px
  SM: 'sm', // 16px
  MD: 'md', // 24px
  LG: 'lg', // 32px
  XL: 'xl', // 48px
  XXL: 'xxl', // 64px
};

export type Props = {|
  ...AppBoxProps,
  name: $Values<typeof ICON_NAME>,
  className?: string,
  color?: Responsive<string>,
  size?: Responsive<$Values<typeof ICON_SIZE>>,
|};

const getSize = (size: $PropertyType<Props, 'size'> = 'md'): number => {
  switch (size) {
    case 'xs':
      return 3;
    case 'sm':
      return 4;
    case 'md':
    default:
      return 6;
    case 'lg':
      return 8;
    case 'xl':
      return 10;
    case 'xxl':
      return 12;
  }
};

const IconInner: StyledComponent<{}, {}, any> = styled(AppBox).attrs(props => ({
  minSize: getSize(props.variant),
  maxSize: getSize(props.variant),
}))(
  variant({
    variants: {
      xs: {
        size: 3,
        p: '2px',
      },
      sm: {
        size: 4,
        p: '2px',
      },
      md: {
        size: 6,
        p: '5px',
      },
      lg: {
        size: 8,
        p: '4px',
      },
      xl: {
        size: 10,
        p: '8px',
      },
      xxl: {
        size: 12,
        p: '11px',
      },
    },
  }),
);

const Icon = React.forwardRef<Props, HTMLElement>(
  ({ name, size = ICON_SIZE.MD, color = 'inherit', className, ...props }: Props, ref) => {
    const IconSvg = Icons[name];

    return (
      <IconInner
        as={IconSvg}
        variant={size}
        className={cn('icon', className)}
        color={color}
        ref={ref}
        css={{ overflow: 'visible !important' }}
        {...props}
      />
    );
  },
);

Icon.displayName = 'Icon';

export default Icon;
