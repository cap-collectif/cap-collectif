import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import colors from '~/utils/colors'

export const NavContainer: StyledComponent<any, {}, HTMLUListElement> = styled.ul`
  width: 100%;
  list-style: none;
  display: flex;
  padding: 0;
  margin-bottom: 0;

  @media (max-width: 768px) {
    overflow-x: scroll;
    :-webkit-scrollbar {
      display: none;
    }

    -ms-overflow-style: none;
  }
`
export const NavItem = styled.li<{
  active?: boolean
}>`
  margin-right: 20px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  border-bottom: ${({ active }) => (active ? `2px solid ${colors.primaryColor}` : '')};
  padding-bottom: 10px;

  a {
    cursor: pointer;
    color: ${({ active }) => (active ? colors.primaryColor : colors.darkGray)};
  }

  a:hover,
  a:active,
  a:focus {
    text-decoration: none;
  }
`
export const Count = styled.span<{
  active?: boolean
}>`
  font-weight: 600;
  height: 16px;
  padding: 0 4px;
  background: ${({ active }) => (active ? 'rgba(3, 136, 204, 0.2)' : colors.lightGray)};
  color: ${({ active }) => active && colors.primaryColor};
  border-radius: 8px;
  margin-left: 5px;
  font-size: 12px;
`
export const Header: StyledComponent<any, {}, HTMLElement> = styled.nav`
  width: calc(100% - 230px);
  background: ${colors.white};
  padding: 15px 15px 0 15px;
  position: fixed;
  z-index: 1;

  div:first-child {
    display: flex;
    justify-content: space-between;
    a {
      font-size: 14px;
      line-height: 14px;
      & svg {
        color: inherit;
        margin-right: 5px;
      }

      font-weight: 600;
      color: ${colors.primaryColor};
      display: flex;
      cursor: pointer;
    }
    i {
      font-size: 11px;
      padding-top: 3px;
    }
  }

  h1 {
    font-size: 18px;
    font-weight: 600;
    color: ${colors.darkText};
    margin: 0;
    margin-bottom: 15px;
    word-break: break-all;
  }

  @media (max-width: 768px) {
    width: 100%;
    position: absolute;
  }
`
export const Content: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  width: 100%;
  margin-top: 95px;
  @media (max-width: 768px) {
    margin-top: 120px;
  }
`
