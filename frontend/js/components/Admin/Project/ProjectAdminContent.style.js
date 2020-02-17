// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

export const NavContainer: StyledComponent<{}, {}, HTMLUListElement> = styled.ul`
  width: 100%;
  list-style: none;
  display: flex;
  padding: 0;
  margin-bottom: 0;
  overflow: scroll;
`;

export const NavItem: StyledComponent<{ active?: boolean }, {}, HTMLLIElement> = styled.li`
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

  a:hover {
    text-decoration: none;
  }
`;

export const Count: StyledComponent<{ active?: boolean }, {}, HTMLSpanElement> = styled.span`
  font-weight: 600;
  height: 16px;
  padding: 0 4px;
  background: ${({ active }) => (active ? 'rgba(3, 136, 204, 0.2)' : colors.lightGray)};
  color: ${({ active }) => active && colors.primaryColor};
  border-radius: 8px;
  margin-left: 3px;
  font-size: 12px;
  margin-top: 1px;
`;

export const Header: StyledComponent<{}, {}, HTMLElement> = styled.nav`
  width: calc(100% - 230px);
  background: ${colors.white};
  padding: 15px 15px 0 15px;
  position: fixed;
  z-index: 1;

  div:first-child {
    display: flex;
    justify-content: space-between;
    a {
      font-size: 16px;
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
    font-size: 16px;
    font-weight: 600;
    color: ${colors.darkText};
    margin: 0;
    margin-bottom: 15px;
  }

  @media (max-width: 768px) {
    width: 100%;
    position: absolute;
  }
`;

export const Content: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 100%;
  margin-top: 90px;
  @media (max-width: 768px) {
    margin-top: 120px;
  }
`;
