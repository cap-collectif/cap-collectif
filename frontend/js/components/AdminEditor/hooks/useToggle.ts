import { useState } from 'react'

export default function useToggle(initialValue: (() => boolean) | boolean): [boolean, (...args: Array<any>) => any] {
  const [value, setValue] = useState<boolean>(initialValue)

  const toggle = () => setValue(state => !state)

  return [value, toggle]
}
