/* @flow */
import styled, { css, type StyledComponent } from 'styled-components';
import colors from '../../utils/colors';

type Props = {
  theme?: {
    mainNavbarText: string,
    mainNavbarBg: string,
    mainNavbarBgActive: string,
    mainNavbarTextActive: string,
  },
};

export const NavigationContainer: StyledComponent<
  Props,
  { mainNavbarBg: string },
  HTMLDivElement,
> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: relative;
  min-height: 50px;
  padding: 0 15px;
  background-color: ${props => props.theme.mainNavbarBg};
  border-bottom: 1px solid ${colors.borderColor};

  & .skip-links {
    position: absolute;
  }
`;

export const NavigationHeader: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  height: 50px;
  position: relative;
  text-align: center;
`;

export const Brand: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: inline-block;
  width: 100%;
  height: 100%;
  padding: 5px 15px 5px 0;
  font-size: 18px;

  img {
    max-height: 100%;
  }
`;

export const Bar: StyledComponent<Props, { mainNavbarText: string }, HTMLSpanElement> = styled.span`
  background-color: ${props => props.theme.mainNavbarText};
  display: block;
  width: 22px;
  height: 2px;
  border-radius: 1px;

  & + & {
    margin-top: 4px;
  }
`;

export const Toggle: StyledComponent<
  Props,
  { mainNavbarBgActive: string, mainNavbarTextActive: string, mainNavbarText: string },
  HTMLButtonElement,
> = styled.button`
  flex: 0;
  position: relative;
  padding: 9px 10px;
  margin-top: 8px;
  margin-bottom: 8px;
  background-color: transparent;
  background-image: none;
  border: 1px solid transparent;
  border-radius: 4px;
  border-color: ${props => props.theme.mainNavbarText};

  &[aria-expanded='true'],
  &:hover {
    background-color: ${props => props.theme.mainNavbarBgActive};
    border-color: transparent;

    ${Bar} {
      background-color: ${props => props.theme.mainNavbarTextActive};
    }
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

export const NavigationContentDesktop: StyledComponent<{}, {}, HTMLElement> = styled.nav`
  justify-content: flex-end;
  align-items: center;
  flex: 1;
  width: 100%;
  height: 100%;
  display: none;

  @media (min-width: 768px) {
    display: flex;
  }
`;

export const NavigationContentMobile: StyledComponent<
  Props,
  { mainNavbarBg: string },
  HTMLElement,
> = styled.nav`
  background-color: ${props => props.theme.mainNavbarBg};
  position: absolute;
  top: 100%;
  left: 0;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  flex: 1;
  width: 100%;
  display: flex;

  @media (min-width: 768px) {
    display: none;
  }
`;

export const verticalContentRightMixin = css`
  padding-left: 0;
  flex-direction: column;
  width: 100%;
`;

export const NavigationContentRight: StyledComponent<
  { vertical?: boolean },
  {},
  HTMLDivElement,
> = styled.div`
  display: flex;
  flex-direction: row;
  padding-left: 15px;
  flex: 0 0 auto;
  height: 100%;

  ${props => props.vertical && verticalContentRightMixin}
`;
