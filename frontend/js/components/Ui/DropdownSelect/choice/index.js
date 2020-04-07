// @flow
import * as React from 'react';
import * as S from './index.style';
import { useDropdownSelect } from '~ui/DropdownSelect';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

type Props = {|
  +isIndeterminate?: boolean,
  +disabled?: boolean,
  +className?: string,
  +onClick?: (e: Event) => void | Promise<any>,
  +emitChange?: boolean,
  +value: string,
  +children: React.Node,
|};

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
  const { onChange, value: dropdownValue, isMultiSelect } = useDropdownSelect();
  const isChecked = isMultiSelect ? dropdownValue?.includes(value) : dropdownValue === value;
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
            onChange([...((dropdownValue: any): $ReadOnlyArray<string>).filter(v => v !== value)]);
          } else {
            onChange([...(dropdownValue || []), value]);
            if (indeterminate) {
              setIndeterminate(false);
            }
          }
        } else {
          onChange(value);
          if (indeterminate) {
            setIndeterminate(false);
          }
        }
      }
    },
    [
      indeterminate,
      disabled,
      dropdownValue,
      emitChange,
      isChecked,
      isMultiSelect,
      onChange,
      onClick,
      value,
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
