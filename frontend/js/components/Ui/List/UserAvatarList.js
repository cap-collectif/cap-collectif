// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

type CommonProps = {|
  +max?: number,
  +spaceBetweenAvatar?: number,
  +avatarSize?: number,
|};

type Props = {|
  ...CommonProps,
  +hasHiddenAvatarTooltip?: boolean,
  +children: any,
|};

type PropsAvatarHidden = {|
  ...CommonProps,
  totalAvatar: number,
  onMouseOver?: () => void,
  onMouseOut?: () => void,
  onFocus?: () => void,
  onBlur?: () => void,
  reference?: any,
|};

const DEFAULT_AVATAR_SIZE = 45;

const UserAvatarListWrapper: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  position: relative;
`;

export const AvatarWrapper: StyledComponent<
  { max: number, index: number, avatarSize?: number, spaceBetweenAvatar: number },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'avatar-wrapper'
})`
  position: relative;
  z-index: ${props => props.max - props.index};

  img,
  svg {
    margin-right: 0;
    border: 2px solid white;
  }

  &:not(:first-child) {
    margin-left: ${props => `${props.spaceBetweenAvatar}px`};
  }
`;

const AvatarDefaultButton = styled.button`
  outline: none;
  border: none;
  background: none;
  padding: 0;
  color: ${colors.darkGray} !important;
  background-color: ${colors.borderColor} !important;
  height: ${({ avatarSize }) => avatarSize || DEFAULT_AVATAR_SIZE}px;
  width: ${({ avatarSize }) => avatarSize || DEFAULT_AVATAR_SIZE}px;
  border-radius: 50%;
`;

export const AvatarHidden = ({
  max = 5,
  spaceBetweenAvatar = -10,
  avatarSize,
  totalAvatar,
  onMouseOver,
  onMouseOut,
  reference,
}: PropsAvatarHidden) => (
  <AvatarWrapper
    index={max}
    max={max}
    spaceBetweenAvatar={spaceBetweenAvatar}
    onMouseOver={onMouseOver}
    onFocus={onMouseOver}
    onMouseOut={onMouseOut}
    onBlur={onMouseOut}
    ref={reference}>
    <AvatarDefaultButton
      avatarSize={avatarSize}
      bsStyle="link"
      id="show-all"
      className="more__link text-center">
      {`+${totalAvatar - max >= 100 ? '99' : totalAvatar - max}`}
    </AvatarDefaultButton>
  </AvatarWrapper>
);

const UserAvatarList = ({
  children,
  avatarSize,
  max = 5,
  spaceBetweenAvatar = -10,
  hasHiddenAvatarTooltip = false,
}: Props) => {
  return (
    <UserAvatarListWrapper>
      {children.slice(0, max).map((child, index) => (
        <AvatarWrapper max={max} index={index} key={index} spaceBetweenAvatar={spaceBetweenAvatar}>
          {child}
        </AvatarWrapper>
      ))}

      {!hasHiddenAvatarTooltip && children.length > max && (
        <AvatarHidden
          max={max}
          spaceBetweenAvatar={spaceBetweenAvatar}
          avatarSize={avatarSize}
          totalAvatar={children.length}
        />
      )}
    </UserAvatarListWrapper>
  );
};

export default UserAvatarList;
