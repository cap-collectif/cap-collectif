// @flow
import styled, { type StyledComponent } from 'styled-components';

export const Circle: StyledComponent<
  { color: string, size: number },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'circle',
})`
  background-color: ${props => props.color};
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
  border-radius: ${props => `${props.size / 2}px`};
`;

const AvatarBadgeContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: inline-block;
  position: relative;

  .circle {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: -5px;
    right: -9px;
  }
`;

export default AvatarBadgeContainer;
