// @flow
import React, { useState, type Node, type ComponentType } from 'react';
import styled, { css } from 'styled-components';

const hidden = css`
  display: ${({ visible }) => (visible ? 'block' : 'none')};
`;

export type DialogState = {
  visible: boolean,
  show: () => void,
  toggle: () => void,
  hide: () => void,
};

type DialogBackdropProps = DialogState;

export const DialogBackdrop: ComponentType<DialogBackdropProps> = styled('div').attrs(
  ({ hide }) => ({
    role: 'presentation',
    onClick: hide,
  }),
)`
  ${hidden}
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.3);
`;

type DialogWrapperProps = DialogState & {
  role: string,
};

export const DialogWrapper: ComponentType<DialogWrapperProps> = styled('div')`
  ${hidden}
  width: 350px;
  height: auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  padding: 20px;
  box-shadow: 1px 3px 4px rgba(0, 0, 0, 0.3);
  background-color: rgba(255, 255, 255, 1);
`;

export function useDialogState(initialState: boolean = false): DialogState {
  const [visible, setVisible] = useState<boolean>(initialState);
  return {
    visible,
    show: (): void => {
      setVisible(true);
    },
    toggle: (): void => {
      setVisible(state => !state);
    },
    hide: () => setVisible(false),
  };
}

type DialogProps = DialogState & {
  children: Node,
};

function Dialog({ children, ...rest }: DialogProps) {
  return (
    <DialogWrapper role="dialog" {...rest}>
      {children}
    </DialogWrapper>
  );
}

export default Dialog;
