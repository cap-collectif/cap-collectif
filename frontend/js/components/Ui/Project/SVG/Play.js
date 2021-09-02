// @flow
import * as React from 'react';

const Play = () => {
  return (
    <svg
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate3d(-50%,-50%,0)',
      }}
      width="48px"
      height="48px"
      viewBox="0 0 48 48"
      fill="none">
      <rect opacity="0.6" width="48" height="48" rx="24" fill="#272B30" />
      <path
        d="M33 22.2679C34.3333 23.0377 34.3333 24.9623 33 25.7321L21 32.6603C19.6667 33.4301 18 32.4678 18 30.9282V17.0718C18 15.5322 19.6667 14.5699 21 15.3397L33 22.2679Z"
        fill="white"
      />
    </svg>
  );
};

export default Play;
