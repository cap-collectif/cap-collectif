// @ts-nocheck
import { $Values } from 'utility-types'
import * as React from 'react'
import { variant as variantStyled } from 'styled-system'
import styled from 'styled-components'
import AppBox from '~ui/Primitives/AppBox'
import { FontWeight, LineHeight } from '~ui/Primitives/constants'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'
import S from './Button.style'
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon'
import Spinner from '~ds/Spinner/Spinner'

export type ButtonProps = AppBoxProps & {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link'
  variantColor?: 'primary' | 'danger' | 'hierarchy'
  variantSize?: 'small' | 'medium' | 'big'
  leftIcon?: $Values<typeof ICON_NAME> | React.ReactElement<typeof Icon>
  rightIcon?: $Values<typeof ICON_NAME> | React.ReactElement<typeof Icon>
  children?: JSX.Element | JSX.Element[] | string
  disabled?: boolean
  alternative?: boolean
  isLoading?: boolean
}
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
}
const ButtonInner = styled(AppBox)(
  // styled-component is wrongly type for styled-system,
  // then we have an error when we use it with this one
  { ...S().common },
  ({ variantColor, isLoading, alternative }) =>
    variantStyled({
      variants: {
        primary: S(isLoading)[variantColor].primary,
        secondary: S(isLoading)[variantColor].secondary,
        tertiary: S(isLoading, alternative)[variantColor].tertiary,
        link: S(isLoading)[variantColor].link,
      },
    }),
)
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variantSize,
      variant,
      variantColor = 'primary',
      leftIcon,
      rightIcon,
      children,
      disabled,
      alternative,
      isLoading,
      ...props
    }: ButtonProps,
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
        px={variantSize ? SIZE[variantSize].px : 0}
        py={variantSize ? SIZE[variantSize].py : 0}
        variantColor={variantColor}
        variant={variant}
        alternative={alternative}
        isLoading={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner marginRight={1} />
            {children}
          </>
        ) : (
          <>
            {leftIcon &&
              (typeof leftIcon === 'string' ? (
                <Icon color="inherit" name={leftIcon} size={ICON_SIZE.MD} marginRight={1} />
              ) : (
                React.cloneElement(leftIcon, {
                  marginRight: 1,
                })
              ))}

            {children}

            {rightIcon &&
              (typeof rightIcon === 'string' ? (
                <Icon color="inherit" name={rightIcon} size={ICON_SIZE.MD} marginLeft={1} />
              ) : (
                React.cloneElement(rightIcon, {
                  marginLeft: 1,
                })
              ))}
          </>
        )}
      </ButtonInner>
    )
  },
)
Button.displayName = 'Button'
export default Button
