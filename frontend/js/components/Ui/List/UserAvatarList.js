// @flow
import * as React from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

type Props = {|
  +avatarSize?: number,
  +spaceBetweenAvatar?: number,
  +max?: number,
  +hiddenAvatarTooltip?: React.Node,
  +children: any,
|};

const DEFAULT_AVATAR_SIZE = 45;

const UserAvatarListWrapper: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  position: relative;
`;

const AvatarWrapper: StyledComponent<
  { max: number, index: number, avatarSize?: number, spaceBetweenAvatar: number },
  {},
  HTMLDivElement,
> = styled.div`
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

const UserAvatarList = ({
  max = 5,
  spaceBetweenAvatar = -10,
  children,
  avatarSize,
  hiddenAvatarTooltip,
}: Props) => {
  const renderRestOfAvatar = () => (
    <AvatarWrapper index={max} max={max} spaceBetweenAvatar={spaceBetweenAvatar}>
      <AvatarDefaultButton
        avatarSize={avatarSize}
        bsStyle="link"
        id="show-all"
        className="more__link text-center">
        {`+${children.length - max >= 100 ? '99' : children.length - max}`}
      </AvatarDefaultButton>
    </AvatarWrapper>
  );

  return (
    <UserAvatarListWrapper>
      {children.slice(0, max).map((child, index) => (
        <AvatarWrapper max={max} index={index} key={index} spaceBetweenAvatar={spaceBetweenAvatar}>
          {child}
        </AvatarWrapper>
      ))}

      {children.length > max &&
        (hiddenAvatarTooltip ? (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="more-avatar">{hiddenAvatarTooltip}</Tooltip>}>
            {renderRestOfAvatar()}
          </OverlayTrigger>
        ) : (
          renderRestOfAvatar()
        ))}
    </UserAvatarListWrapper>
  );
};

export default UserAvatarList;
