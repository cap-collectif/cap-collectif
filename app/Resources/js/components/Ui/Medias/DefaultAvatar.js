// @flow
import * as React from 'react';
import styled from 'styled-components';
import colors from '../../../utils/colors';

type Props = {
  size: 'small' | 'normal',
};

export const Container = styled.svg.attrs({
  className: 'default-avatar',
})`
  border-radius: 50%;
  background-color: ${colors.primaryColor};
`;

export class DefaultAvatar extends React.Component<Props> {
  static defaultProps = {
    size: 'normal',
  };

  render() {
    const { size } = this.props;

    const getSize = size === 'normal' ? '45px' : '34px';

    return (
      <Container
        role="img"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width={getSize}
        height={getSize}
        viewBox="-11 -9 46 46">
        <path
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeLinejoin="round"
          strokeMiterlimit="10"
          d="M.5,23a10.135,10.135,0,0,1,1-4.057c.705-1.41,3.65-2.387,7.347-3.756,1-.371.836-2.981.393-3.468C8.2,10.576,7.32,9.235,7.32,6c0-3.265,2.13-5,4.68-5s4.68,1.735,4.68,5c0,3.235-.881,4.576-1.92,5.719-.443.487-.607,3.1.393,3.468,3.7,1.369,6.642,2.346,7.347,3.756A10.135,10.135,0,0,1,23.5,23Z"
        />
      </Container>
    );
  }
}

export default DefaultAvatar;
