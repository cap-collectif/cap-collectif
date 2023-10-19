// @ts-nocheck
import { FC } from 'react'
import DetailDrawerHeader from './DetailDrawerHeader'
import DetailDrawerBody from './DetailDrawerBody'

export type Props = {
  readonly isOpen: boolean
  readonly onClose?: () => void
}

declare const DetailDrawer: FC<Props> & {
  Header: typeof DetailDrawerHeader
  Body: typeof DetailDrawerBody
}

export default DetailDrawer
