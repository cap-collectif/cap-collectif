// @flow
import * as React from 'react';
import * as S from './index.style';
import DropdownSelectChoice from '~ui/DropdownSelect/choice';
import DropdownSelectMenu from '~ui/DropdownSelect/menu';
import type { Context } from '~ui/DropdownSelect/context';
import { DropdownSelectContext } from '~ui/DropdownSelect/context';

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

type Props = {|
  +title: string,
  +value?: string | null,
  +onChange?: (value: string) => void,
  +children: React.ChildrenArray<
    React.Element<typeof DropdownSelectChoice> | React.Element<typeof DropdownSelectMenu>,
  >,
|};

export const useDropdownSelect = (): Context => {
  const context = React.useContext(DropdownSelectContext);
  if (!context) {
    throw new Error(`You can't use the DropdownSelectContext outsides a DropdownSelect component.`);
  }
  return context;
};

const DropdownSelect = ({ children, title, value, onChange }: Props) => {
  const contextValue = React.useMemo(() => ({ value, onChange }), [value, onChange]);

  return (
    <DropdownSelectContext.Provider value={contextValue}>
      <S.Container>
        <S.Header>{title}</S.Header>
        <S.Body>{children}</S.Body>
      </S.Container>
    </DropdownSelectContext.Provider>
  );
};

DropdownSelect.Choice = DropdownSelectChoice;
DropdownSelect.Menu = DropdownSelectMenu;

export default DropdownSelect;
