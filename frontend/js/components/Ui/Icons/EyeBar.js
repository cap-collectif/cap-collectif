// @flow
import * as React from 'react';

type Props = {|
  +className?: string,
  +size: number,
  +color: string,
|};

const EyeBar = ({ className, size, color }: Props) => (
  <svg
    className={className}
    width={`${size}px`}
    height={`${size}px`}
    role="img"
    viewBox="0 0 42 42"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg">
    <g
      id="eye-bar"
      stroke="none"
      strokeWidth="1"
      fill="none"
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round">
      <g id="view-off" transform="translate(1.000000, 4.000000)" stroke={color} strokeWidth="2">
        <path
          d="M32.53,10.48 C34.9886104,12.2609804 37.217723,14.3389478 39.1666667,16.6666667 C39.1666667,16.6666667 30.5866667,27.5 20,27.5 C18.3042858,27.4905896 16.6193235,27.229982 15,26.7266667"
          id="Path"
        />
        <path
          d="M7.44666667,22.8333333 C4.99737241,21.0571292 2.77620238,18.9859777 0.833333333,16.6666667 C0.833333333,16.6666667 9.41333333,5.83333333 20,5.83333333 C21.4060535,5.83926637 22.805831,6.02123746 24.1666667,6.375"
          id="Path"
        />
        <path d="M13.3333333,16.6666667 C13.3333333,12.9847683 16.3181017,10 20,10" id="Path" />
        <path
          d="M26.6666667,16.6666667 C26.6666667,20.348565 23.6818983,23.3333333 20,23.3333333"
          id="Path"
        />
        <line x1="36.25" y1="0.416666667" x2="3.75" y2="32.9166667" id="Path" />
      </g>
    </g>
  </svg>
);

EyeBar.defaultProps = {
  size: 16,
  color: '#000',
};

export default EyeBar;
