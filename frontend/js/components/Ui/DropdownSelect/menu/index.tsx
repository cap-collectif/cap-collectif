import * as React from 'react'
import styled from 'styled-components'
import * as S from './index.style'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import DropdownSelectChoice from '~ui/DropdownSelect/choice'
export type DropdownSelectPointing = 'left' | 'right'
type Props = {
  readonly name: string
  readonly pointing?: DropdownSelectPointing
  readonly children: React.ChildrenArray<
    React.ReactElement<typeof DropdownSelectChoice> | React.ReactElement<typeof DropdownSelectMenu>
  >
}
const ArrowIcon = styled(Icon)`
  transform: scaleX(-1);
`

const DropdownSelectMenu = ({ children, name, pointing = 'right' }: Props) => {
  return (
    <S.Container pointing={pointing}>
      <S.ContainerInner>
        <span>{name}</span>
        <ArrowIcon name={ICON_NAME.chevronLeft} size="1rem" />
      </S.ContainerInner>
      <S.ListContainer>
        <ul>{children}</ul>
      </S.ListContainer>
    </S.Container>
  )
}

DropdownSelectMenu.displayName = 'DropdownSelect.Menu'
export default DropdownSelectMenu
