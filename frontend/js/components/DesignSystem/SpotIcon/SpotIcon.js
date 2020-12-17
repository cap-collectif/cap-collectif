// @flow
import * as React from 'react';
import cn from 'classnames';
import styled, { type StyledComponent } from 'styled-components';
import { variant } from 'styled-system';
import type { AppBoxProps, Responsive } from '~ui/Primitives/AppBox.type';
import * as SpotIcons from './index';
import AppBox from '~ui/Primitives/AppBox';

export const SPOT_ICON_NAME = {
  PENCIL_SOFTWARE: 'PENCIL_SOFTWARE',
  EMAIL_TIMEOUT: 'EMAIL_TIMEOUT',
  RATING_CLICK: 'RATING_CLICK',
  DELETE: 'DELETE',
};

export const SPOT_ICON_SIZE = {
  SM: 'sm', // 56px
  MD: 'md', // 64px
  LG: 'lg', // 104px
};

export type Props = {|
  ...AppBoxProps,
  name: $Values<typeof SPOT_ICON_NAME>,
  className?: string,
  color?: Responsive<string>,
  size?: Responsive<$Values<typeof SPOT_ICON_SIZE>>,
|};

const getSize = (size: $PropertyType<Props, 'size'> = 'md'): number | string => {
  switch (size) {
    case 'sm':
      return 11;
    case 'md':
    default:
      return 12;
    case 'lg':
      return '104px';
  }
};

const SpotIconInner: StyledComponent<{}, {}, any> = styled(AppBox).attrs(props => ({
  minSize: getSize(props.variant),
  maxSize: getSize(props.variant),
}))(
  variant({
    variants: {
      sm: {
        size: 11,
        p: 2,
      },
      md: {
        size: 12,
        p: '10px',
      },
      lg: {
        size: '104px',
        p: 4,
      },
    },
  }),
);

const SpotIcon = React.forwardRef<Props, HTMLElement>(
  ({ name, size = SPOT_ICON_SIZE.MD, className, color = 'inherit', ...props }: Props, ref) => {
    const SpotIconSvg = SpotIcons[name];

    return (
      <SpotIconInner
        as={SpotIconSvg}
        variant={size}
        className={cn('spot-icon', className)}
        ref={ref}
        color={color}
        css={{ overflow: 'visible !important' }}
        {...props}
      />
    );
  },
);

SpotIcon.displayName = 'SpotIcon';

export default SpotIcon;
