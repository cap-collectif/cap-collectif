import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'
import colors from '~/utils/colors'
import PickableList from '~ui/List/PickableList'

export const Header: StyledComponent<any, {}, HTMLElement> = styled.header`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0;

  & > div {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  & > div:last-of-type {
    display: flex;
    align-items: center;

    .clearable-input {
      width: 250px;
    }
  }
`
export const DashboardCampaignHeader: StyledComponent<any, {}, typeof PickableList.Header> = styled(
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
export const ButtonCreate: StyledComponent<any, {}, HTMLButtonElement> = styled.button`
  padding: 8px;
  background-color: ${colors.blue};
  color: #fff;
  border: none;
  margin-left: 10px;
  ${MAIN_BORDER_RADIUS};
`
export const ButtonDelete: StyledComponent<any, {}, HTMLButtonElement> = styled.button`
  background-color: transparent;
  color: ${colors.red};
  border: none;
`
