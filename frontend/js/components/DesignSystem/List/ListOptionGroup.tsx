// @ts-nocheck
import * as React from 'react'
import { useMemo } from 'react'
import { Flex } from '@cap-collectif/ui'
import type { Context } from '~ds/List/ListOptionGroup.context'
import { ListOptionGroupContext } from '~ds/List/ListOptionGroup.context'
import ListOptionGroupItem from '~ds/List/ListOptionGroupItem'
import { FlexProps } from '~ui/Primitives/Layout/Flex'

type Props = Omit<FlexProps, 'type' | 'value' | 'onChange'> & {
  readonly type: 'checkbox' | 'radio'
  readonly value?: string | string[]
  readonly onChange?: (newValue: string | string[]) => void
  children?: JSX.Element | JSX.Element[] | string
}
export const ListOptionGroup = ({ children, type, value, onChange, ...props }: Props) => {
  const context = useMemo<Context>(
    () => ({
      onChange,
      value,
      type,
    }),
    [onChange, value, type],
  )
  return (
    <ListOptionGroupContext.Provider value={context}>
      {/** @ts-ignore */}
      <Flex direction="column" {...props}>
        {children}
      </Flex>
    </ListOptionGroupContext.Provider>
  )
}
ListOptionGroup.Item = ListOptionGroupItem
export default ListOptionGroup
