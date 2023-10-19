// @ts-nocheck
import { FC } from 'react'
import type { FlexProps } from '../../Ui/Primitives/Layout/Flex'

declare const InlineList: FC<
  Omit<FlexProps, 'as'> & {
    readonly separator: string
  }
>

export default InlineList
