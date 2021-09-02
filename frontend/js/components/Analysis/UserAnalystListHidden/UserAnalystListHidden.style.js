// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

const UserAnalystListHiddenContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'user-analyst-list-hidden',
})`
  .avatar-wrapper {
    button {
      font-size: 12px;
      background-color: ${colors.iconGrayColor} !important;
      color: #fff !important;
    }
  }
`;

export const TooltipAnalystListHiddenContainer: StyledComponent<
  {},
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'tooltip-analyst-list-hidden',
})`
  display: flex;
  flex-direction: column;
  padding: 4px 0;
  text-align: left;

  img,
  svg {
    margin: 0;
  }
`;

export const UserAvatarWrapper: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'user-avatar-wrapper',
})`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;

  &:first-child {
    margin-top: 4px;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export const UsernameWrapper: StyledComponent<{}, {}, HTMLSpanElement> = styled.span`
  margin-left: 3px;
`;

export default UserAnalystListHiddenContainer;
