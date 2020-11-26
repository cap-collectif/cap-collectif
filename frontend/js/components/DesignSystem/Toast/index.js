// @flow
import type { ToastProps } from '~ds/Toast/Toast';
import { Emitter } from '~/config';
import { UIEvents } from '~/dispatchers/enums';
import uuid from '~/utils/uuid';

export const toast = (value: $Diff<ToastProps, { id: * }>): void => {
  Emitter.emit(UIEvents.ToastShow, { position: 'top', ...value, id: uuid() });
};
