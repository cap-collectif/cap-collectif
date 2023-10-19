// @ts-nocheck
import { ReactChild } from 'react'
import { PolymorphicComponent } from '../../../Ui/Primitives/AppBox'

type Props = {
  readonly isNumeric?: boolean
  readonly visibleOnHover?: boolean
  readonly noPlaceholder?: boolean
  readonly children: string | ReactChild | null
}

declare const Td: PolymorphicComponent<Props>

export default Td
