// @flow
import * as React from 'react';
import * as S from './index.style';
import InlineSelectChoice from '~ui/InlineSelect/choice';
import type { Context } from '~ui/InlineSelect/context';
import { InlineSelectContext } from '~ui/InlineSelect/context';
import InlineList from '~ui/List/InlineList';

/**
 *
 * <InlineSelect value={myValue} onChange={handler}>
 *   <InlineSelect.Choice value="all" />
 *   <InlineSelect.Choice value="published" />
 *   <InlineSelect.Choice value="draft" />
 * </InlineSelect>
 *
 * Where `myValue` is one of 'all' | 'published' | 'draft'
 *
 * */

type Props = {|
  +value?: string | null,
  +onChange?: (value: string) => void,
  +children: React.ChildrenArray<React.Element<typeof InlineSelectChoice>>,
|};

export const useInlineSelect = (): Context => {
  const context = React.useContext(InlineSelectContext);
  if (!context) {
    throw new Error(`You can't use the InlineSelectContext outsides a InlineSelect component.`);
  }
  return context;
};

const InlineSelect = ({ children, value, onChange }: Props) => {
  const contextValue = React.useMemo(() => ({ value, onChange }), [value, onChange]);

  return (
    <InlineSelectContext.Provider value={contextValue}>
      <S.Container>
        <InlineList>{children}</InlineList>
      </S.Container>
    </InlineSelectContext.Provider>
  );
};

InlineSelect.Choice = InlineSelectChoice;

export default InlineSelect;
