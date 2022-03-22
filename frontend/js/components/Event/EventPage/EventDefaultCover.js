// @flow
import * as React from 'react';
import { useSelector } from 'react-redux';
import { Flex } from '@cap-collectif/ui';

const EventDefaultCover = () => {
  const backgroundColor = useSelector(state => state.default.parameters['color.btn.primary.bg']);
  return (
    <Flex
      className="eventHeader__coverImage"
      borderRadius={[0, 'accordion']}
      alignItems="center"
      justifyContent="center"
      width={['100%', '405px']}
      overflow="hidden"
      minHeight="270px"
      maxHeight="315px"
      backgroundColor={backgroundColor}>
      <svg
        width="411"
        style={{ maxWidth: '100%' }}
        height="253"
        viewBox="0 0 411 253"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <rect width="411" height="253" rx="8" fill={backgroundColor} />
        <path
          d="M247.25 91.251H162.75C159.16 91.251 156.25 94.1611 156.25 97.751V169.251C156.25 172.841 159.16 175.751 162.75 175.751H247.25C250.84 175.751 253.75 172.841 253.75 169.251V97.751C253.75 94.1611 250.84 91.251 247.25 91.251Z"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M156.25 117.25H253.75"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M182.251 101V78.25"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M227.749 101V78.25"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Flex>
  );
};

export default EventDefaultCover;
