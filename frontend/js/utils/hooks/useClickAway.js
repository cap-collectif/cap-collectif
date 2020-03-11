// @flow
import * as React from 'react';

const useClickAway = <T: HTMLElement>(ref: { current: T | null }, onClickAway: () => void) => {
  const handleClickOutside = React.useCallback(
    (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(((event.target: any): Node))) {
        onClickAway();
      }
    },
    [ref, onClickAway],
  );
  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  });
};

export default useClickAway;
