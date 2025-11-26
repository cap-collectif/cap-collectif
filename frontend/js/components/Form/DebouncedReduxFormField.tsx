import * as React from 'react'
import debounce from '@shared/utils/debounce-promise'
import component from './Field'

type Props = {
  input: {
    name: string
    value: any
    onChange: (value: any) => void
    onBlur?: () => void
    onFocus?: () => void
  }
  meta?: {
    touched: boolean
    dirty?: boolean
    pristine?: boolean
    error?: any
    warning?: any
  }
  debounceMs?: number
  [key: string]: any
}

const DebouncedReduxFormField = ({ input, debounceMs = 400, ...rest }: Props) => {
  const [localValue, setLocalValue] = React.useState(input.value || '')
  const debouncedOnChangeRef = React.useRef(debounce(input.onChange, debounceMs))

  React.useEffect(() => {
    setLocalValue(input.value || '')
  }, [input.value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setLocalValue(value)
    debouncedOnChangeRef.current(value)
  }

  const FieldComponent = component as any

  return (
    <FieldComponent
      {...rest}
      input={{
        ...input,
        value: localValue,
        onChange: handleChange,
      }}
    />
  )
}

export default DebouncedReduxFormField
