import * as React from 'react'
import * as S from './index.style'
type Props = {
  readonly className?: string
  readonly children: JSX.Element | JSX.Element[] | string
}

const DropdownSelectSeparator = ({ children, className }: Props) => {
  return (
    <S.Container className={className}>
      <span>{children}</span>
    </S.Container>
  )
}

DropdownSelectSeparator.displayName = 'DropdownSelect.Separator'
export default DropdownSelectSeparator
