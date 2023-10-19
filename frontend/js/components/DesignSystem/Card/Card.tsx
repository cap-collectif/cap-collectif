// @ts-nocheck
import * as React from 'react'
import AppBox from '~ui/Primitives/AppBox'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'

type Props = AppBoxProps & { children?: JSX.Element | JSX.Element[] | string }

export const Card = React.forwardRef<HTMLElement, Props>(({ children, ...props }: Props, ref) => {
  return (
    <AppBox p={6} borderRadius="card" border="card" borderColor="gray.150" ref={ref} {...props}>
      {children}
    </AppBox>
  )
})
Card.displayName = 'Card'
export default Card
