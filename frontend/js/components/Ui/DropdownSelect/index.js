// @flow
import * as React from 'react';
import * as S from './index.style';
import DropdownSelectChoice from '~ui/DropdownSelect/choice';
import DropdownSelectMenu from '~ui/DropdownSelect/menu';
import type { Context } from '~ui/DropdownSelect/context';
import { DropdownSelectContext } from '~ui/DropdownSelect/context';
import DropdownSelectHeader from '~ui/DropdownSelect/header';
import DropdownSelectMessage from '~ui/DropdownSelect/message';

/**
 *
 * <DropdownSelect value={myValue}>
 *   <DropdownSelect.Choice value="oldest" />
 *   <DropdownSelect.Choice value="newest" />
 * </DropdownSelect>
 *
 * <DropdownSelect value={myValue}>
 *   <DropdownSelect.Menu name="Etape 1">
 *     <DropdownSelect.Choice value="oldest" />
 *     <DropdownSelect.Choice value="newest" />
 *   </DropdownSelect.Menu>
 *   <DropdownSelect.Menu name="Etape 2">
 *     <DropdownSelect.Choice value="oldest" />
 *     <DropdownSelect.Choice value="newest" />
 *   </DropdownSelect.Menu>
 * </DropdownSelect>
 * */

export type Props = {|
  +className?: string,
  +isMultiSelect?: boolean,
  +title: string,
  +shouldOverflow?: boolean,
  +value?: string | string[] | null,
  +onChange?: (value: string | string[]) => void,
  +children: React.Node,
|};

export const useDropdownSelect = (): Context => {
  const context = React.useContext(DropdownSelectContext);
  if (!context) {
    throw new Error(`You can't use the DropdownSelectContext outsides a DropdownSelect component.`);
  }
  return context;
};

const DropdownSelect = ({
  children,
  title,
  value,
  onChange,
  shouldOverflow = false,
  isMultiSelect = false,
  className,
}: Props) => {
  const contextValue = React.useMemo(() => ({ value, onChange, isMultiSelect }), [
    value,
    onChange,
    isMultiSelect,
  ]);

  return (
    <DropdownSelectContext.Provider value={contextValue}>
      <S.Container shouldOverflow={shouldOverflow} className={className}>
        <S.Header>{title}</S.Header>
        <S.Body>{children}</S.Body>
      </S.Container>
    </DropdownSelectContext.Provider>
  );
};

DropdownSelect.Choice = DropdownSelectChoice;
DropdownSelect.Header = DropdownSelectHeader;
DropdownSelect.Menu = DropdownSelectMenu;
DropdownSelect.Message = DropdownSelectMessage;

export default DropdownSelect;
