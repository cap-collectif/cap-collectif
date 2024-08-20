// @ts-nocheck
import { $Diff } from 'utility-types'
import type { ToastProps } from '~ds/Toast/Toast'
import { Emitter } from '~/config'
import { UIEvents } from '~/dispatchers/enums'
import uuid from '@shared/utils/uuid'

export const toast = (
  value: $Diff<
    ToastProps,
    {
      id: any
    }
  >,
): void => {
  Emitter.emit(UIEvents.ToastShow, {
    position: 'top',
    ...value,
    id: uuid(),
  })
}
export const clearToasts = (): void => {
  Emitter.emit(UIEvents.ToastClear)
}
