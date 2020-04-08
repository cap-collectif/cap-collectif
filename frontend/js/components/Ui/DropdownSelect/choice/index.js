// @flow
import * as React from 'react';
import * as S from './index.style';
import { useDropdownSelect } from '~ui/DropdownSelect';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import type {
  DropdownMode,
  DropdownValueAddedRemovedType,
  DropdownValueType,
} from '~ui/DropdownSelect/context';

type Props = {|
  +isIndeterminate?: boolean,
  +disabled?: boolean,
  +className?: string,
  +onClick?: (e: Event) => void | Promise<any>,
  +emitChange?: boolean,
  +value: string | Object,
  +children: React.Node,
|};

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
        ((initialValue: any): $ReadOnlyArray<string>)?.includes(value) ||
        ((dropdownValue: any): $ReadOnlyArray<string>)?.includes(value)
      );
    }
    if (mode === 'add-remove') {
      return (
        ((initialValue: any): $ReadOnlyArray<string>)?.includes(value) ||
        ((dropdownValue: any): DropdownValueAddedRemovedType)?.values?.includes(value)
      );
    }
  }
  return initialValue === value || dropdownValue === value;
};

const DropdownSelectChoice = ({
  children,
  value,
  onClick,
  className,
  disabled = false,
  isIndeterminate = false,
  emitChange = true,
}: Props) => {
  const [indeterminate, setIndeterminate] = React.useState(isIndeterminate);
  const {
    onChange,
    value: dropdownValue,
    isMultiSelect,
    allValues,
    initialValue,
    mode,
    setInitialValue,
  } = useDropdownSelect();
  const isChecked = getChecked(isMultiSelect, mode, initialValue, value, dropdownValue);
  const handler = React.useCallback(
    e => {
      if (disabled) {
        return;
      }
      if (onClick) {
        onClick(e);
      }
      if (onChange && emitChange) {
        if (isMultiSelect) {
          if (isChecked && !indeterminate) {
            setInitialValue(((initialValue: any): $ReadOnlyArray<string>).filter(v => v !== value));
            if (mode === 'normal') {
              onChange([
                ...((dropdownValue: any): $ReadOnlyArray<string>).filter(v => v !== value),
              ]);
            } else if (mode === 'add-remove') {
              onChange({
                all: allValues,
                values: [
                  ...((dropdownValue: any): DropdownValueAddedRemovedType).values.filter(
                    v => v !== value,
                  ),
                ],
                added: ((dropdownValue: any): DropdownValueAddedRemovedType).added.filter(
                  v => v !== value,
                ),
                removed: [
                  ...((dropdownValue: any): DropdownValueAddedRemovedType).removed,
                  ...(((allValues: any): $ReadOnlyArray<string>).includes(value) ? [value] : []),
                ],
              });
            }
          } else {
            if (mode === 'normal') {
              onChange([...(((dropdownValue: any): $ReadOnlyArray<string>) || []), value]);
            } else if (mode === 'add-remove') {
              onChange({
                all: allValues,
                values: [...((dropdownValue: any): DropdownValueAddedRemovedType).values, value],
                removed: ((dropdownValue: any): DropdownValueAddedRemovedType).removed.filter(
                  v => v !== value,
                ),
                added: [
                  ...((dropdownValue: any): DropdownValueAddedRemovedType).added,
                  ...(indeterminate ||
                  !isChecked ||
                  !((allValues: any): $ReadOnlyArray<string>).includes(value)
                    ? [value]
                    : []),
                ],
              });
            }
            if (indeterminate) {
              setIndeterminate(false);
            }
          }
        } else {
          setInitialValue(null);
          onChange(value);
          if (indeterminate) {
            setIndeterminate(false);
          }
        }
      }
    },
    [
      disabled,
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
    ],
  );
  return (
    <S.Container onClick={handler} className={className} isDisabled={disabled}>
      {indeterminate && <Icon name={ICON_NAME.plus} size="1rem" />}
      {isChecked && !indeterminate && <Icon name={ICON_NAME.check} size="1rem" color="#333" />}
      <span>{children}</span>
    </S.Container>
  );
};

DropdownSelectChoice.displayName = 'DropdownSelect.Choice';

export default DropdownSelectChoice;
