// @flow
import * as React from 'react';
import styled from 'styled-components';
import colors from '../../../utils/colors';

type Props = {
  className?: string,
  size: number,
};

export const Container = styled.svg.attrs({
  className: 'default-avatar',
})`
  border-radius: 50%;
  background-color: ${colors.primaryColor};
`;

export class DefaultBg extends React.Component<Props> {
  static defaultProps = {
    size: 45,
  };

  render() {
    const { className, size } = this.props;

    return (
      <Container
        className={className}
        role="img"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width={`${size}px`}
        height={`${size}px`}
        viewBox="0 0 200 200"
        enableBackground="new 0 0 200 200">
        <g>
          <path
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            d="M100,160.011h68.011c0,0,0-12.163-5.916-23.993c-4.41-8.819-22.024-14.039-45.683-22.908V95.367c0,0,7.239-6.661,7.239-18.49c2.959,0,5.916-11.826,0-14.785c0-1.754,7.927-16.569,5.916-26.613c-2.957-14.786-44.353-14.786-47.309-2.955c-17.742,0-5.915,27.169-5.915,29.568c-5.913,2.959-2.957,14.785,0,14.785c0,11.829,7.238,17.473,7.238,17.473v18.759c-23.655,8.875-41.273,14.089-45.682,22.908c-5.911,11.83-5.911,23.993-5.911,23.993H100z"
          />
        </g>
      </Container>
    );
  }
}

export default DefaultBg;
