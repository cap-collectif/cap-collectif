// @flow
import * as React from 'react';
import { variant as variantStyled } from 'styled-system';
import styled from 'styled-components';
import AppBox from '~ui/Primitives/AppBox';
import { FontWeight, LineHeight } from '~ui/Primitives/constants';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import S from './Button.style';
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon';

type Props = {|
  ...AppBoxProps,
  variant: 'primary' | 'secondary' | 'tertiary' | 'link',
  variantColor?: 'primary' | 'danger',
  size?: 'small' | 'medium' | 'big',
  leftIcon?: $Values<typeof ICON_NAME>,
  rightIcon?: $Values<typeof ICON_NAME>,
  children?: React.Node,
  disabled?: boolean,
  alternative?: boolean,
|};

const SIZE = {
  small: {
    px: 2,
    py: 1,
  },
  medium: {
    px: 4,
    py: 3,
  },
  big: {
    px: 8,
    py: 3,
  },
};

const ButtonInner = styled(AppBox)(
  // styled-component is wrongly type for styled-system,
  // then we have an error when we use it with this one
  // $FlowFixMe
  {
    ...S().common,
  },
  ({ variantColor, alternative }) =>
    variantStyled({
      variants: {
        primary: S()[variantColor].primary,
        secondary: S()[variantColor].secondary,
        tertiary: S(alternative)[variantColor].tertiary,
        link: S()[variantColor].link,
      },
    }),
);

const Button = React.forwardRef<Props, HTMLButtonElement>(
  (
    {
      size = 'medium',
      variant,
      variantColor = 'primary',
      leftIcon,
      rightIcon,
      children,
      disabled,
      alternative,
      ...props
    }: Props,
    ref,
  ) => {
    return (
      <ButtonInner
        ref={ref}
        as="button"
        type="button"
        display="flex"
        alignItems="center"
        fontFamily="body"
        fontSize={3}
        fontWeight={FontWeight.Semibold}
        lineHeight={LineHeight.Base}
        border="none"
        borderRadius="button"
        bg="transparent"
        disabled={disabled}
        px={SIZE[size].px}
        py={SIZE[size].py}
        variantColor={variantColor}
        variant={variant}
        alternative={alternative}
        {...props}>
        {leftIcon && <Icon color="inherit" name={leftIcon} size={ICON_SIZE.MD} marginRight={2} />}
        {children}
        {rightIcon && <Icon color="inherit" name={rightIcon} size={ICON_SIZE.MD} marginLeft={2} />}
      </ButtonInner>
    );
  },
);

Button.displayName = 'Button';

export default Button;
