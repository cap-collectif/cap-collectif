// @flow
import { useCallback, useState } from 'react';

type Return = [boolean, () => void];

const useBoolean = (initialValue: boolean = false): Return => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  return [value, toggle];
};

export default useBoolean;
