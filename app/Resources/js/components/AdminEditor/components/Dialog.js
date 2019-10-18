// @flow
import React, { useState, type Node } from 'react';
import styled, { css } from 'styled-components';

const hidden = css`
  display: ${({ visible }) => (visible ? 'block' : 'none')};
`;

export const DialogBackdrop = styled.div.attrs(({ hide }) => ({
  role: 'presentation',
  onClick: hide,
}))`
  ${hidden}
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.3);
`;

export const DialogWrapper = styled.div`
  ${hidden}
  width: 350px;
  height: auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  padding: 20px;
  box-shadow: 1px 3px 4px rgba(0, 0, 0, 0.3);
  background-color: rgba(255, 255, 255, 1);
`;

export type DialogState = {
  visible: boolean,
  show: () => void,
  toggle: () => void,
  hide: () => void,
};

export function useDialog(initialState: boolean = false): DialogState {
  const [visible, setVisible] = useState<boolean>(initialState);

  return {
    visible,
    show: () => setVisible(true),
    toggle: () => setVisible(state => !state),
    hide: () => setVisible(false),
  };
}

type Props = DialogState & {
  children: Node,
};

function Dialog({ children, ...rest }: Props) {
  return (
    <DialogWrapper role="dialog" {...rest}>
      {children}
    </DialogWrapper>
  );
}

export default Dialog;
