// @flow
import { useState, useEffect } from 'react';

type WindowSize = {|
  +width: number,
  +height: number
|}

export function useWindowWidth(): WindowSize {
  const [windowWidth, setWindowWidth] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth({
        width: window.innerWidth,
        height: window.innerHeight
      })
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowWidth;
}
