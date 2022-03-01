// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/styles/modules/colors';

export const LinkSeparator: StyledComponent<{}, {}, HTMLSpanElement> = styled.span`
  padding: 0 8px;

  @media (max-width: 767px) {
    display: none;
  }
`;

export const ButtonParameters: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  text-decoration: underline;
  width: fit-content;
  background: transparent;
  color: #fff;
  border: none;
  padding: 0;
`;

export const ButtonDecline: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  background: transparent;
  color: #fff;
  border: none;
  padding: 0;
  margin-right: 20px;
  font-weight: 600;
  line-height: 24px;
`;

export const ButtonAccept: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  background-color: #fff;
  color: ${colors['neutral-gray']['900']};
  border: none;
  border-radius: 4px;
  padding: 12px 16px;
  font-weight: 600;
  line-height: 24px;

  @media (max-width: 479px) {
    padding: 4px 8px;
  }
`;

export const CookieBanner: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  z-index: 1040 !important;
  background-color: ${colors['neutral-gray']['900']};
  font-size: 14px;

  .cookie-banner.active {
    align-items: center;
    display: flex;
    justify-content: space-between;
  }

  @media (max-width: 479px) {
    flex-direction: column;
    padding: 16px;

    .cookie-button {
      margin-top: 8px;
      width: 100%;
    }
  }

  @media (min-width: 480px) and (max-width: 1079px) {
    padding: 32px;
    flex-direction: column;

    .cookie-button {
      display: flex;
      justify-content: center;
      margin-top: 24px;
      width: 100%;
    }
  }

  @media (min-width: 1080px) {
    padding: 32px 37px;

    .cookie-button {
      width: 100%;
      min-width: 380px;
      max-width: 400px;
      text-align: right;
      padding-right: 0;
      padding-left: 0;
    }
  }
`;
