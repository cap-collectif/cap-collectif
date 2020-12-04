// @flow
import * as React from 'react';
import { variant as variantStyled } from 'styled-system';
import styled from 'styled-components';
import AppBox from '~ui/Primitives/AppBox';
import { FontWeight, LineHeight } from '~ui/Primitives/constants';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import S from './Button.style';
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon';
import Spinner from '~ds/Spinner/Spinner';

type Props = {|
  ...AppBoxProps,
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link',
  variantColor?: 'primary' | 'danger',
  variantSize?: 'small' | 'medium' | 'big',
  leftIcon?: $Values<typeof ICON_NAME>,
  rightIcon?: $Values<typeof ICON_NAME>,
  children?: React.Node,
  disabled?: boolean,
  alternative?: boolean,
  isLoading?: boolean,
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
  ({ variantColor, isLoading, alternative }) =>
    variantStyled({
      variants: {
        primary: S(isLoading)[variantColor].primary,
        secondary: S(isLoading)[variantColor].secondary,
        tertiary: S(isLoading, alternative)[variantColor].tertiary,
        link: S(isLoading)[variantColor].link,
      },
    }),
);

const Button = React.forwardRef<Props, HTMLButtonElement>(
  (
    {
      variantSize = 'medium',
      variant,
      variantColor = 'primary',
      leftIcon,
      rightIcon,
      children,
      disabled,
      alternative,
      isLoading,
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
        px={SIZE[variantSize].px}
        py={SIZE[variantSize].py}
        variantColor={variantColor}
        variant={variant}
        alternative={alternative}
        isLoading={isLoading}
        {...props}>
        {isLoading ? (
          <>
            <Spinner marginRight={leftIcon || rightIcon ? 2 : 0} />
            {leftIcon || rightIcon ? children : null}
          </>
        ) : (
          <>
            {leftIcon && (
              <Icon color="inherit" name={leftIcon} size={ICON_SIZE.MD} marginRight={2} />
            )}
            {children}
            {rightIcon && (
              <Icon color="inherit" name={rightIcon} size={ICON_SIZE.MD} marginLeft={2} />
            )}
          </>
        )}
      </ButtonInner>
    );
  },
);

Button.displayName = 'Button';

export default Button;
