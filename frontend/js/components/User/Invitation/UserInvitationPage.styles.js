// @flow
import styled, { type StyledComponent } from 'styled-components';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import colors from '~/utils/colors';
import { mediaQueryTablet } from '~/utils/sizes';

export const UserInvitationPageContainer: StyledComponent<
  {},
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'user-invitation-page',
})`
  position: fixed;
  display: flex;
  flex-direction: column;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
`;

export const UserInvitationPageFormContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 20px 30px;
  ${MAIN_BORDER_RADIUS};
  border: 1px solid ${colors.lightGray};
  background: ${colors.white};
  min-height: 100%;
  max-height: 100%;
  overflow-y: scroll;
  min-width: 100%;
  max-width: 100%;
  @media screen and (min-width: ${mediaQueryTablet.minWidth}) {
    min-height: 300px;
    max-height: 70%;
    min-width: 40%;
    max-width: 40%;
  }
  & button {
    width: 100%;
  }
`;

export const UserInvitationPageFormHeader: StyledComponent<{}, {}, HTMLElement> = styled.header`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid ${colors.lightGray};
  & p {
    margin: 0;
  }
  & img {
    max-width: 100%;
  }
`;
