import styled from 'styled-components'
import colors from '~/utils/colors'
import { CHECKBOX_CELL_WIDTH } from '~ui/List/PickableList/header/styles'

export const Container = styled.div.attrs({
  className: 'pickableList-row',
})`
  padding: 15px 10px;
  display: flex;
  flex-direction: row;
  background: ${colors.white};
  border-bottom: 1px solid ${colors.lightGray};
  &:last-of-type {
    border-bottom: none;
  }
  & > input[type='checkbox'] {
    min-width: ${CHECKBOX_CELL_WIDTH};
    max-width: ${CHECKBOX_CELL_WIDTH};
    width: ${CHECKBOX_CELL_WIDTH};
    height: ${CHECKBOX_CELL_WIDTH};
    flex: none;
    margin: 0 8px 0 0;
  }
`
export const ChildWrapper = styled.div.attrs({
  className: 'pickableList-row-content',
})``
