// @flow
import * as React from 'react';

type Props = {|
  +className?: string,
  +size: number,
  +color: string,
|};

const EarthIcon = ({ className, size, color }: Props) => {
  return (
    <svg
      className={className}
      width={`${size}px`}
      height={`${size}px`}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24">
      <path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M23.5,11.941A11.538,11.538,0,0,1,11.968,23.485,11.662,11.662,0,0,1,.5,11.734,11.246,11.246,0,0,1,11.505.5c.166-.007.332-.01.5-.01A11.433,11.433,0,0,1,23.5,11.941Z"
      />
      <path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.505.5c-6,6.5-6,14.98,0,22.98"
      />
      <path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.505.5c6,6.5,6,14.977,0,22.977"
      />
      <line
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        x1="2.386"
        y1="5.484"
        x2="21.52"
        y2="5.484"
      />
      <line
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        x1="0.503"
        y1="11.484"
        x2="23.5"
        y2="11.484"
      />
      <line
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        x1="1.985"
        y1="17.484"
        x2="22.085"
        y2="17.484"
      />
    </svg>
  );
};
EarthIcon.defaultProps = {
  size: 16,
  color: '#000',
};

export default EarthIcon;
