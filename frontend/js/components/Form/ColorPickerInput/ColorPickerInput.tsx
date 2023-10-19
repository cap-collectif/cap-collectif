import * as React from 'react'
import { FormControl } from 'react-bootstrap'
import ChromePicker from 'react-color/lib/Chrome'
import useClickAway from '~/utils/hooks/useClickAway'
import { ColorPickerInputContainer, PreviewColor } from './ColorPickerInput.style'

const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

type Color = {
  hex: string
  hsl: {
    h: number
    s: number
    l: number
    a: number
  }
  oldHue: number
  rgb: {
    r: number
    g: number
    b: number
    a: number
  }
  source: string
}
type Props = {
  onChange: (value: string) => void
  value?: string
  label?: string
  disabled?: boolean
  placeholder?: string
  className?: string
  getOpacity?: (opacity: number) => void
  opacity?: number | null | undefined
}

const ColorPickerInput = ({
  onChange,
  value = '',
  placeholder,
  className,
  label,
  disabled,
  getOpacity,
  opacity,
}: Props) => {
  const [showPicker, setShowPicker] = React.useState<boolean>(false)
  const pickerReference = React.useRef(null)
  useClickAway(
    pickerReference,
    () => {
      if (showPicker) setShowPicker(false)
    },
    [],
  )

  const handleChange = (color: Color) => {
    const colorOpacity = color.rgb.a
    if (getOpacity && colorOpacity > 0 && colorOpacity < 100) getOpacity(colorOpacity * 100)
    onChange(color.hex)
  }

  const getValue = () => {
    if (opacity) {
      return { ...hexToRgb(value), a: opacity / 100 }
    }

    return value
  }

  return (
    <ColorPickerInputContainer ref={pickerReference} hasValue={!!value} className={className}>
      {value && <PreviewColor color={value} />}

      <FormControl
        type="text"
        label={label}
        disabled={disabled}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        onFocus={() => setShowPicker(true)}
      />

      {showPicker && <ChromePicker color={getValue()} onChangeComplete={handleChange} disableAlpha={false} />}
    </ColorPickerInputContainer>
  )
}

export default ColorPickerInput
