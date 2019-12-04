// @flow
import * as React from 'react';
import styled, { type StyledComponent, type SVGSVGElement } from 'styled-components';
import colors from '../../../utils/colors';
import { avatarPx } from '../../../utils/sizes';

type Props = {
  size: 'small' | 'normal',
};

export const Container: StyledComponent<{}, {}, SVGSVGElement> = styled.svg.attrs({
  className: 'default-avatar-group',
})`
  border-radius: 50%;
  color: #fff;
  background-color: ${colors.defaultCustomColor};
`;

export class DefaultAvatarGroup extends React.Component<Props> {
  static defaultProps = {
    size: 'normal',
  };

  render() {
    const { size } = this.props;

    const getSize = avatarPx[size];

    return (
      <Container
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-8 -7 40 40"
        width={getSize}
        height={getSize}
        role="img"
        x="0px"
        y="0px"
        version="1.1">
        <circle className="cls-1" cx="7.5" cy="7.75" r="4.25" stroke="#FFFFFF" fill="none" />
        <path className="cls-1" d="M.5,20.5a7,7,0,0,1,14,0Z" stroke="#FFFFFF" fill="none" />
        <path
          className="cls-1"
          d="M13.26,5A4.249,4.249,0,1,1,14,11.189a4.381,4.381,0,0,1-.5-.429"
          fill="none"
          stroke="#FFFFFF"
        />
        <path
          className="cls-1"
          d="M14.5,13.79a7.005,7.005,0,0,1,9,6.71H17"
          stroke="#FFFFFF"
          fill="none"
        />
      </Container>
    );
  }
}

export default DefaultAvatarGroup;
