// @ts-nocheck
import { PolymorphicComponent } from '../../Ui/Primitives/AppBox'
import { ReactNode } from 'react'

export type Props = {
  readonly disabled?: boolean
  readonly value: string
  readonly children: ReactNode
}

declare const ListOptionGroupItem: PolymorphicComponent<Props>

export default ListOptionGroupItem
