// @flow
import * as React from 'react';
import { useInput, useKeyboardShortcuts } from '@liinkiing/react-hooks';
import styled, { css, type StyledComponent } from 'styled-components';
import type { Props as InputProps } from '~ui/Form/Input/Input';
import { BASE_INPUT } from '~/utils/styles/variables';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';

type Props = {|
  ...$Diff<InputProps, { value: *, defaultValue: * }>,
  className?: string,
  initialValue?: ?string,
  disabled?: boolean,
  icon?: React.Node,
  iconRight?: boolean,
  onSubmit?: (value: string) => void,
  onClear?: () => void,
  ariaLabel?: string,
  autoFocus?: boolean,
|};

const CloseIcon = styled(Icon)``;

export const ClearableInputContainer: StyledComponent<
  { hasIcon: boolean, disabled?: boolean },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'clearable-input',
})`
  position: relative;
  opacity: ${props => (props.disabled ? '.5' : 1)};
  & i,
  svg:not(${/* sc-selector */ CloseIcon}) {
    position: absolute;
    left: 14px;
    height: 100%;
    top: unset;
    right: unset;
    bottom: unset;
    display: flex;
    max-width: 14px;
    align-items: center;
  }

  input {
    ${BASE_INPUT};
    padding-right: 35px;
    ${props =>
      props.hasIcon &&
      css`
        padding-left: 40px;
      `};
    width: 100%;
  }

  ${props =>
    props.disabled &&
    css`
      opacity: 0.5;
      border: 1px solid ${colors.disabledGray};
      & input:disabled {
        background-color: #fff;
      }
    `}
`;

const CloseIconContainer: StyledComponent<
  { isVisible: boolean },
  {},
  HTMLSpanElement,
> = styled.span`
  ${props =>
    props.isVisible
      ? css`
          display: inline-block;
        `
      : css`
          display: none;
        `};
  height: 100%;
  position: absolute;
  right: 0;
  padding: 0 14px 0 10px;
  &:hover {
    cursor: pointer;
    opacity: 0.5;
  }
  & ${/* sc-selector */ CloseIcon} {
    height: 100%;
  }
`;

const RightIconContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  height: 100%;
  display: inline-block;
  position: absolute;
  right: 0;
  padding: 0 30px 0 10px;
`;

const ClearableInput = ({
  icon,
  iconRight,
  onSubmit,
  onClear,
  onChange,
  className,
  initialValue,
  disabled,
  ariaLabel,
  ...rest
}: Props) => {
  const [input, clearInput] = useInput(initialValue || '');
  const onChangeHandler = e => {
    if (onChange) {
      onChange(e);
    }
    input.onChange(e);
  };
  const canClear = input.value !== '';
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const closeIconContainerRef = React.useRef<HTMLElement | null>(null);
  const clear = () => {
    clearInput();
    if (onClear) {
      onClear();
    }
  };
  useKeyboardShortcuts(
    [
      {
        preventDefault: true,
        keys: ['Enter'],
        action() {
          if (onSubmit) {
            onSubmit(input.value);
          }
        },
      },
    ],
    inputRef,
    [input.value],
  );
  useKeyboardShortcuts(
    [
      {
        preventDefault: true,
        keys: ['Enter', 'Space'],
        action() {
          if (canClear) {
            clear();
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }
        },
      },
    ],
    closeIconContainerRef,
    [canClear],
  );
  return (
    <ClearableInputContainer
      hasIcon={!!icon && !iconRight}
      className={className}
      disabled={disabled}>
      {!iconRight && icon}
      <input
        disabled={disabled}
        {...rest}
        {...input}
        onChange={onChangeHandler}
        ref={inputRef}
        aria-label={ariaLabel}
      />
      <CloseIconContainer
        ref={closeIconContainerRef}
        tabIndex={0}
        isVisible={canClear}
        onClick={clear}>
        {canClear && <CloseIcon name={ICON_NAME.close} size="0.8rem" />}
      </CloseIconContainer>
      {!canClear && iconRight && <RightIconContainer>{icon}</RightIconContainer>}
    </ClearableInputContainer>
  );
};

export default ClearableInput;
