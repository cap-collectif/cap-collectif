// @flow
import * as React from 'react';
import * as S from './index.style';
import { useDropdownSelect } from '~ui/DropdownSelect';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

type Props = {|
  +value: string,
  +children: React.Node,
|};

const DropdownSelectChoice = ({ children, value }: Props) => {
  const { onChange, value: dropdownValue } = useDropdownSelect();
  const handler = React.useCallback(() => {
    if (onChange) {
      onChange(value);
    }
  }, [onChange, value]);
  return (
    <S.Container onClick={handler}>
      {dropdownValue === value && <Icon name={ICON_NAME.check} size="1rem" />}
      <span>{children}</span>
    </S.Container>
  );
};

DropdownSelectChoice.displayName = 'DropdownSelect.Choice';

export default DropdownSelectChoice;
