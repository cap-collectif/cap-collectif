// @flow
import styled, { type StyledComponent } from 'styled-components';
import { mediaQueryMobile, mediaQueryTablet } from '~/utils/sizes';
import { MAIN_BORDER_RADIUS_SIZE } from '~/utils/styles/variables';
import { baseUrl } from '~/config';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'user-invitation-page',
})`
  display: flex;
  flex-direction: row;
  height: 100%;

  & > div {
    width: 50%;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    flex-direction: column;

    & > div {
      width: 100%;
    }

    .content-container {
      margin-top: -10px;
      border-radius: 10px 10px 0 0;
    }
  }
`;

export const LogoContainer: StyledComponent<
  { bgColor: string },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'logo-container',
})`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.bgColor};

  img {
    max-height: 80px;
    z-index: 1;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    position: static;
    padding: 8px 0 18px 0;
    order: -1;
    flex-shrink: 0;

    img {
      height: 80px;
    }
  }
`;

export const Symbols: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("${baseUrl}/image/pattern-triangle.png");
  opacity: 0.1;
  background-size: auto;

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    display: none;
  }
`;

export const ContentContainer: StyledComponent<
  { primaryColor: string, btnText: string },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'content-container',
})`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  padding: 100px 130px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.15);
  z-index: 1;
  overflow: scroll;

  h1 {
    font-size: 30px;
    margin-bottom: 20px;
    color: ${props => props.primaryColor};
  }

  .welcome {
    font-size: 22px;
  }

  .btn-submit {
    display: flex; /* flex to fix safari centering */
    flex-direction: column;
    align-items: center;
    justify-content: center;
    align-self: flex-start;
    background-color: ${props => props.primaryColor};
    color: ${props => props.btnText};
    border: none;
    padding: 16px 35px;
  }

  @media only screen and (min-width: ${mediaQueryTablet.minWidth}) and (max-width: ${mediaQueryTablet.maxWidth}) {
    overflow: scroll;
    padding: 50px;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    box-shadow: none;
    padding: 40px 20px 60px 20px;

    h1 {
      font-size: 25px;
    }

    .welcome {
      font-size: 18px;
    }

    .btn-submit {
      position: fixed;
      right: 0;
      left: 0;
      bottom: 0;
      width: 100%;
      border-radius: ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE} 0 0;
    }
  }
`;
