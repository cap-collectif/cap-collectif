import * as React from 'react'
import * as S from './index.style'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import type {
  DropdownMode,
  DropdownValueAddedRemovedType,
  DropdownValueType,
  Context,
} from '~ui/DropdownSelect/context'
import { DropdownSelectContext } from '~ui/DropdownSelect/context'
type Props = {
  readonly isIndeterminate?: boolean
  readonly disabled?: boolean
  readonly className?: string
  readonly hasBody?: boolean
  readonly onClick?: (e: Event) => void | Promise<any>
  readonly emitChange?: boolean
  readonly value: string | Record<string, any>
  readonly children: JSX.Element | JSX.Element[] | string
}
export const useDropdownSelect = (): Context => {
  const context = React.useContext(DropdownSelectContext)

  if (!context) {
    throw new Error(`You can't use the DropdownSelectContext outsides a DropdownSelect component.`)
  }

  return context
}

const getChecked = (
  isMultiSelect: boolean,
  mode: DropdownMode,
  initialValue?: DropdownValueType,
  value,
  dropdownValue,
): boolean => {
  if (isMultiSelect) {
    if (mode === 'normal') {
      return (
        (initialValue as any as ReadonlyArray<string>)?.includes(value) ||
        (dropdownValue as any as ReadonlyArray<string>)?.includes(value)
      )
    }

    if (mode === 'add-remove') {
      return (
        (initialValue as any as ReadonlyArray<string>)?.includes(value) ||
        (dropdownValue as any as DropdownValueAddedRemovedType)?.values?.includes(value)
      )
    }
  }

  return initialValue === value || dropdownValue === value
}

const DropdownSelectChoice = ({
  children,
  value,
  onClick,
  className,
  hasBody = false,
  disabled = false,
  isIndeterminate = false,
  emitChange = true,
}: Props): JSX.Element => {
  const [indeterminate, setIndeterminate] = React.useState(isIndeterminate)
  const {
    onChange,
    value: dropdownValue,
    defaultValue,
    isMultiSelect,
    allValues,
    initialValue,
    mode,
    setInitialValue,
    disabled: dropdownDisabled,
  } = useDropdownSelect()
  const isChecked = getChecked(isMultiSelect, mode, initialValue, value, dropdownValue)
  const handler = React.useCallback(
    e => {
      if (disabled || dropdownDisabled) {
        return
      }

      if (onClick) {
        onClick(e)
      }

      if (onChange && emitChange) {
        if (isMultiSelect) {
          if (isChecked && !indeterminate) {
            setInitialValue((initialValue as any as ReadonlyArray<string>).filter(v => v !== value))

            if (mode === 'normal') {
              onChange([...(dropdownValue as any as ReadonlyArray<string>).filter(v => v !== value)])
            } else if (mode === 'add-remove') {
              onChange({
                all: allValues,
                values: [...(dropdownValue as any as DropdownValueAddedRemovedType).values.filter(v => v !== value)],
                added: (dropdownValue as any as DropdownValueAddedRemovedType).added.filter(v => v !== value),
                removed: [
                  ...(dropdownValue as any as DropdownValueAddedRemovedType).removed,
                  ...((allValues as any as ReadonlyArray<string>).includes(value) ? [value] : []),
                ],
              })
            }
          } else {
            if (mode === 'normal') {
              onChange([...((dropdownValue as any as ReadonlyArray<string>) || []), value])
            } else if (mode === 'add-remove') {
              onChange({
                all: allValues,
                values: [...(dropdownValue as any as DropdownValueAddedRemovedType).values, value],
                removed: (dropdownValue as any as DropdownValueAddedRemovedType).removed.filter(v => v !== value),
                added: [
                  ...(dropdownValue as any as DropdownValueAddedRemovedType).added,
                  ...(indeterminate || !isChecked || !(allValues as any as ReadonlyArray<string>).includes(value)
                    ? [value]
                    : []),
                ],
              })
            }

            if (indeterminate) {
              setIndeterminate(false)
            }
          }
        } else {
          setInitialValue(null)

          if (isChecked) {
            onChange(defaultValue || null)
          } else {
            onChange(value)
          }

          if (indeterminate) {
            setIndeterminate(false)
          }
        }
      }
    },
    [
      disabled,
      dropdownDisabled,
      onClick,
      onChange,
      emitChange,
      isMultiSelect,
      isChecked,
      indeterminate,
      setInitialValue,
      initialValue,
      mode,
      value,
      dropdownValue,
      allValues,
      defaultValue,
    ],
  )
  return (
    <S.Container onClick={handler} className={className} isDisabled={disabled || dropdownDisabled}>
      {indeterminate && <Icon name={ICON_NAME.plus} size="1rem" />}
      {isChecked && !indeterminate && <Icon name={ICON_NAME.check} size="1rem" color="#333" />}
      {hasBody ? <div className="dropdown-inside-container">{children}</div> : <span>{children}</span>}
    </S.Container>
  )
}

DropdownSelectChoice.displayName = 'DropdownSelect.Choice'
export default DropdownSelectChoice
