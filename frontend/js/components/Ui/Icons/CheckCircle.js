// @flow
import * as React from 'react';

type Props = {|
  +className: string,
  +size: number,
  +color?: string,
|};

export default class CheckCircle extends React.Component<Props> {
  static defaultProps = {
    className: 'img-check-circle',
    size: 15,
    color: '#a7a0a0',
  };

  render() {
    const { className, size, color } = this.props;
    return (
      <svg
        width={`${size}px`}
        height={`${size}px`}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        x="0px"
        y="0px"
        version="1.1"
        className={className}>
        <path
          fill={color}
          d="M18.48,6.449a1.249,1.249,0,0,0-1.747.265l-5.924,8.04L7.042,11.74a1.251,1.251,0,0,0-1.563,1.953l4.783,3.826a1.263,1.263,0,0,0,1.787-.235l6.7-9.087A1.25,1.25,0,0,0,18.48,6.449Z"
        />
        <path
          fill={color}
          d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm0,22A10,10,0,1,1,22,12,10.011,10.011,0,0,1,12,22Z"
        />
      </svg>
    );
  }
}
