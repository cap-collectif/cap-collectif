// @flow
import * as React from 'react';

export type Context = {|
  +hide: () => void,
  +show: () => void,
  +toggle: () => void,
  +hideCloseButton?: boolean,
  +visible: boolean,
|};

export const ModalContext = React.createContext<Context>({
  hide: () => {},
  show: () => {},
  toggle: () => {},
  visible: false,
  hideCloseButton: false,
});

export const useModal = (): Context => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error(`You can't use the ModalContext outsides a Modal component.`);
  }
  return context;
};
