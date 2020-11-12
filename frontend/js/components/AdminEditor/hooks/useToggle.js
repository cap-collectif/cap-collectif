// @flow
import { useState } from 'react';

export default function useToggle(initialValue: (() => boolean) | boolean): [boolean, Function] {
  const [value, setValue] = useState<boolean>(initialValue);
  const toggle = () => setValue(state => !state);

  return [value, toggle];
}
