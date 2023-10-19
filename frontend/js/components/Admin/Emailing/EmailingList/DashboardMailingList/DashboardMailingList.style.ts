import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import colors from '~/utils/colors'
import PickableList from '~ui/List/PickableList'

export const Header: StyledComponent<any, {}, HTMLElement> = styled.header`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  margin: 1rem 0;

  .clearable-input {
    width: 250px;
  }
`
export const DashboardMailingListHeader: StyledComponent<any, {}, typeof PickableList.Header> = styled(
  PickableList.Header,
)`
  align-items: stretch;

  p {
    margin-bottom: 0;

    &:first-of-type {
      flex: 3;
      align-self: start;
    }
  }
`
export const ButtonDelete: StyledComponent<any, {}, HTMLButtonElement> = styled.button`
  background-color: transparent;
  color: ${colors.red};
  border: none;
`
