import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import colors from '~/utils/colors'

const ProposalFormAdminPageTabsContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  h1 {
    font-size: 18px;
    font-weight: 600;
    color: ${colors.darkText};
    margin: 0;
    word-break: break-all;
  }

  header {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    padding: 15px 15px 0 15px;
    border-radius: 4px;

    & > div {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }
  }
`
export const NavContainer = styled.ul<{
  hasProposalFormUrl: boolean
}>`
  display: flex;
  flex-direction: row;
  width: 100%;
  list-style: none;
  padding: 0;
  margin-bottom: 0;
  margin-top: ${props => (props.hasProposalFormUrl ? '15px' : '0')};

  @media (max-width: 768px) {
    overflow-x: scroll;
    :-webkit-scrollbar {
      display: none;
    }

    -ms-overflow-style: none;
  }
`
export const NavItem: StyledComponent<any, {}, HTMLLIElement> = styled.li`
  margin-right: 20px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
  display: flex;

  a {
    cursor: pointer;
    color: ${colors.darkGray};
    padding-bottom: 10px;

    &.active {
      border-bottom: 2px solid ${colors.primaryColor};
      color: ${colors.primaryColor};
    }
  }

  a:hover,
  a:active,
  a:focus {
    text-decoration: none;
  }
`
export const ActionContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  a:last-of-type {
    margin-left: 30px;
  }
`
export default ProposalFormAdminPageTabsContainer
