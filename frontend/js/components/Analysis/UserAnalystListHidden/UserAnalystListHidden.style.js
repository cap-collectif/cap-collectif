// @flow
import styled, { type StyledComponent } from 'styled-components';

const UserAnalystListHiddenContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'user-analyst-list-hidden',
})``;

export const TooltipAnalystListHiddenContainer: StyledComponent<
  {},
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'tooltip-analyst-list-hidden',
})`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  padding: 4px 0;

  img,
  svg {
    margin: 0;
  }

  .circle {
    top: 50%;
    transform: translateY(-50%);
    left: -6px;
    right: initial;
    bottom: initial;
  }
`;

export const UserAvatarWrapper: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'user-avatar-wrapper',
})`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 8px;

  & > a {
    margin-right: 0;
  }
`;

export const UsernameWrapper: StyledComponent<{}, {}, HTMLSpanElement> = styled.span`
  margin-left: 3px;
`;

export default UserAnalystListHiddenContainer;
