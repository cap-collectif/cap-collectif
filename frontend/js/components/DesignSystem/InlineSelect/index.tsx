// @ts-nocheck
import * as React from 'react'
import css from '@styled-system/css'
import InlineSelectChoice from './choice'
import type { Context } from '~ui/InlineSelect/context'
import { InlineSelectContext } from '~ui/InlineSelect/context'
import AppBox from '~ui/Primitives/AppBox'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'
const styles = css({
  listStyle: 'none',
  '& > *': {
    marginRight: 6,
    '&:last-child': {
      marginRight: 0,
    },
  },
})
type Props = AppBoxProps & {
  readonly value?: string | null
  readonly onChange?: (value: string) => void
  readonly children: JSX.Element | JSX.Element[] | string
}
export const useInlineSelect = (): Context => {
  const context = React.useContext(InlineSelectContext)

  if (!context) {
    throw new Error(`You can't use the InlineSelectContext outsides a InlineSelect component.`)
  }

  return context
}

const InlineSelect = ({ children, value, onChange, ...props }: Props) => {
  const contextValue = React.useMemo(
    () => ({
      value,
      onChange,
    }),
    [value, onChange],
  )
  return (
    <InlineSelectContext.Provider value={contextValue}>
      <AppBox as="ul" display="flex" flexDirection="row" m={0} p={0} css={styles} {...props}>
        {children}
      </AppBox>
    </InlineSelectContext.Provider>
  )
}

InlineSelect.Choice = InlineSelectChoice
export default InlineSelect
