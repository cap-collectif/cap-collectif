import * as React from 'react'
import { InlineSelectContext } from '~ui/InlineSelect/context'
import type { Context } from '~ui/InlineSelect/context'

export const useInlineSelect = (): Context => {
  const context = React.useContext(InlineSelectContext)

  if (!context) {
    throw new Error(`You can't use the InlineSelectContext outsides a InlineSelect component.`)
  }

  return context
}
