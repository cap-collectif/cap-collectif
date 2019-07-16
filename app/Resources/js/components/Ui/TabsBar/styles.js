// @flow
import styled, { css } from 'styled-components';
import colors from '../../../utils/colors';

const verticalMixin = css`
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: nowrap;
`;

export const TabsBarContainer = styled.ul`
  opacity: ${props => (props.show ? 1 : 0)};
  height: 100%;
  width: 100%;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  margin: 0;
  padding: 0;

  ${props => props.vertical && verticalMixin}
`;

const activeNavItem = css`
  color: ${props => props.theme.mainNavbarTextActive};
  background-color: ${props => props.theme.mainNavbarBgActive};
`;

export const TabsItemContainer = styled.li`
  position: relative;
  display: block;
  width: ${props => (props.vertical ? '100%' : 'auto')};
  height: 100%;
  text-align: center;
  white-space: nowrap;
  list-style: none;
  cursor: pointer;

  ${props => props.active && activeNavItem}

  & > * {
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: left;
    height: 100%;
    padding: ${props => (props.vertical ? '10px 15px' : '0 15px')};
  }
`;

const activeTabsLinkMixin = css`
  color: ${props => props.theme.mainNavbarTextActive};
  background-color: ${props => props.theme.mainNavbarBgActive};
  text-decoration: none;
`;

const hoverTabsLinkMixin = css`
  color: ${props => props.theme.mainNavbarTextHover};
  background-color: ${props => props.theme.mainNavbarBgActive};
  text-decoration: none;
`;

export const TabsLink = styled.a`
  color: ${props => props.theme.mainNavbarText};
  text-decoration: none;
  cursor: pointer;

  ${props => props.active && activeTabsLinkMixin}

  &:hover,
  &:focus {
    ${hoverTabsLinkMixin}
  }
`;

export const TabsDivider = styled.div`
  height: 1px;
  margin: 9px 0;
  overflow: hidden;
  background-color: #e5e5e5;
`;

export const Dropdown = styled.div`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
`;

const verticalDropdownMenuMixin = css`
  position: relative;
  background: transparent;
  border: 0;
  box-shadow: none;
  width: 100%;
`;

export const DropdownMenu = styled.ul`
  position: absolute;
  top: 100%;
  ${props =>
    props.pullRight
      ? css`
          right: 0;
        `
      : css`
          left: 0;
        `}
  z-index: 1000;
  display: ${props => (props.show ? 'block' : 'none')};
  min-width: 160px;
  padding: 5px 0;
  margin: 0;
  font-size: 14px;
  text-align: left;
  list-style: none;
  background-color: ${props => props.theme.mainNavbarBg};
  border: 1px solid #e3e3e3;
  border-radius: 4px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);

  ${props => props.vertical && verticalDropdownMenuMixin}

  a {
    display: block;
    padding: 3px 20px;
    clear: both;
    font-weight: 400;
    white-space: nowrap;
  }
`;

export const DropdownToggle = styled.button`
  background: transparent;
  border: none;
  text-decoration: none;
  width: 100%;
  height: 100%;
  text-align: left;
  padding: ${props => (props.vertical ? '10px 15px' : '0 15px')};
  color: ${props => props.theme.mainNavbarText};

  &:hover,
  &:focus {
    ${hoverTabsLinkMixin}
  }

  & .caret {
    margin-left: 5px;
  }
`;

export const DropdownSection = styled.ul`
  border-top: 1px solid #e3e3e3;
  border-bottom: 1px solid #e3e3e3;
  margin: 9px 0;
  padding: 9px 0;
`;

export const DropdownSectionTitle = styled.span`
  display: block;
  padding: 3px 20px;
  font-size: 14px;
  color: ${colors.darkGray};
  white-space: nowrap;
`;
