// @flow
import * as React from 'react';

type Props = {
  size?: number,
};

export class DefaultImage extends React.Component<Props> {
  render() {
    const { size } = this.props;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={`${size || '110'}px`}
        height={`${size || '110'}px`}
        viewBox="0 0 24 24">
        <path
          fill="none"
          stroke="#FFFFFF"
          d="M14.5.5H4.5a4,4,0,0,0-4,4v5a4,4,0,0,0,4,4h1v4l4.5-4h4.5a4,4,0,0,0,4-4v-5A4,4,0,0,0,14.5.5Z"
        />
        <path
          fill="none"
          stroke="#FFFFFF"
          d="M11.5,16.5V18A2.5,2.5,0,0,0,14,20.5h2.5l3,3v-3H21A2.5,2.5,0,0,0,23.5,18V15A2.5,2.5,0,0,0,21,12.5h-.5"
        />
      </svg>
    );
  }
}

export default DefaultImage;
