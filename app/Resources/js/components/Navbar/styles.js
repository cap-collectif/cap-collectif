import styled, { css } from 'styled-components';

export const NavigationContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: relative;
  min-height: 50px;
  padding: 0 15px;
  background-color: ${props => props.theme.mainNavbarBg};

  & .skip-links {
    position: absolute;
  }
`;

export const NavigationHeader = styled.div`
  min-width: 120px;
  max-width: 120px;
  height: 50px;
  flex: 0;
  position: relative;
  text-align: center;
`;

export const Brand = styled.div`
  width: 100%;
  height: 100%;
  padding: 5px 15px 5px 0;
  font-size: 18px;

  img {
    max-height: 100%;
  }
`;

export const Bar = styled.span`
  background-color: ${props => props.theme.mainNavbarText};
  display: block;
  width: 22px;
  height: 2px;
  border-radius: 1px;

  & + & {
    margin-top: 4px;
  }
`;

export const Toggle = styled.button`
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

export const NavigationContentDesktop = styled.nav`
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

export const NavigationContentMobile = styled.nav`
  background-color: #fff;
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

export const NavigationContentRight = styled.div`
  display: flex;
  flex-direction: row;
  padding-left: 15px;
  flex: 0 0 auto;
  height: 100%;

  ${props => props.vertical && verticalContentRightMixin}
`;
