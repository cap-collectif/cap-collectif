// @flow
import * as React from 'react';
import { useInput, useKeyboardShortcuts } from '@liinkiing/react-hooks';
import styled, { css, type StyledComponent } from 'styled-components';
import type { Props as InputProps } from '~ui/Form/Input/Input';
import { BASE_INPUT } from '~/utils/styles/variables';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

type Props = {|
  ...$Diff<InputProps, { value: *, defaultValue: * }>,
  initialValue?: ?string,
  icon?: React.Node,
  onSubmit?: (value: string) => void,
  onClear?: () => void,
|};

const CloseIcon = styled(Icon)``;

const ClearableInputContainer: StyledComponent<
  { hasIcon: boolean },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'clearable-input',
})`
  position: relative;
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
    padding-right: 30px;
    ${props =>
      props.hasIcon &&
      css`
        padding-left: 40px;
      `};
    width: 100%;
  }
`;

const CloseIconContainer = styled.span`
  height: 100%;
  position: absolute;
  right: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.5;
  }
  & ${/* sc-selector */ CloseIcon} {
    height: 100%;
  }
`;

const ClearableInput = ({ icon, onSubmit, onClear, initialValue, ...rest }: Props) => {
  const [input, clearInput] = useInput(initialValue || '');
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
    <ClearableInputContainer hasIcon={!!icon}>
      {icon}
      <input {...rest} {...input} ref={inputRef} />
      <CloseIconContainer ref={closeIconContainerRef} tabIndex={0}>
        {canClear && <CloseIcon name={ICON_NAME.close} size="0.8rem" onClick={clear} />}
      </CloseIconContainer>
    </ClearableInputContainer>
  );
};

export default ClearableInput;
