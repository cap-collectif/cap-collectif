// @flow
import { useLayoutEffect, useState } from 'react';

type DOMRect = {|
  +height: number,
  +width: number,
  +x: number,
  +y: number,
|};

export const useBoundingRect = (ref: any): DOMRect => {
  const [boundings, setBoundings] = useState<DOMRect>({
    height: 0,
    width: 0,
    x: 0,
    y: 0,
  });

  useLayoutEffect(() => {
    if (ref.current) {
      setBoundings(ref.current.getBoundingClientRect());
    }
  }, [ref]);

  return boundings;
};
