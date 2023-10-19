// @ts-nocheck
import { FC } from 'react'
import { ModalProps } from './Modal'
import type { ButtonProps } from '../Button/Button'

type Props = ModalProps & {
  readonly options: {
    confirmButton: {
      content: string
      props?: ButtonProps
    }
    cancelButton: {
      content: string
      props?: ButtonProps
    }
  }
  readonly title: React$Node
  readonly body?: React$Node
  readonly onConfirm?: () => void | Promise<void>
  readonly onCancel?: () => void | Promise<void>
}

declare const ConfirmModal: FC<Props>

export default ConfirmModal
