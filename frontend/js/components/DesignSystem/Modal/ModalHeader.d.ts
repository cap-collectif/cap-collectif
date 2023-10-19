// @ts-nocheck
import { FC } from 'react'
import { FlexProps } from '../../Ui/Primitives/Layout/Flex'
import ModalHeaderLabel from './ModalHeaderLabel'

declare const ModalHeader: FC<FlexProps> & {
  Label: typeof ModalHeaderLabel
}

export default ModalHeader
