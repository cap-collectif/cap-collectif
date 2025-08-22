// @ts-nocheck
import * as React from 'react'
import type { FlexProps } from '~ui/Primitives/Layout/Flex'
import Flex from '~ui/Primitives/Layout/Flex'
import AppBox from '~ui/Primitives/AppBox'
import { cleanChildren } from '@shared/utils/cleanChildren'

type Props = FlexProps & {
  separator: string
}

const isLastChild = (index, children) => index + 1 === React.Children.count(children)

export const InlineList = ({ children, separator, spacing = 1, ...props }: Props) => {
  const validChildren = cleanChildren(children)
  return (
    <Flex direction="row" spacing={spacing} align="center" flexWrap="wrap" {...props}>
      {React.Children.map(validChildren, (child, idx) => (
        <>
          {child}

          {!isLastChild(idx, children) && (
            <AppBox as="span" marginLeft={spacing} aria-hidden>
              {separator}
            </AppBox>
          )}
        </>
      ))}
    </Flex>
  )
}
InlineList.displayName = 'InlineList'
export default InlineList
