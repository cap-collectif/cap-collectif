// @flow
import * as React from 'react';
import css from '@styled-system/css';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import { useTable } from '~ds/Table/context';
import TrCheckbox from './TrCheckbox';

type VerticalAlign = 'top' | 'middle' | 'bottom';

type TrProps = {|
  ...AppBoxProps,
  +children: React.Node,
  +rowId?: string,
  +selectable?: boolean,
  +inHead?: boolean,
  +checkboxLabel?: string,
  +verticalAlign?: VerticalAlign,
|};

const styles = (isLoading: ?boolean, verticalAlign: VerticalAlign) =>
  css({
    ':hover': isLoading ? {} : { bg: 'gray.100' },
    '& td': { verticalAlign },
  });

const Tr = ({
  selectable,
  rowId,
  children,
  inHead = false,
  checkboxLabel,
  verticalAlign = 'middle',
  ...props
}: TrProps): React.Node => {
  const { selectable: tableSelectable, isLoading } = useTable();
  const rowSelectable: boolean = typeof selectable === 'boolean' ? selectable : tableSelectable;

  return (
    <AppBox as="tr" id={rowId} css={styles(isLoading, verticalAlign)} {...props}>
      {rowSelectable && <TrCheckbox inHead={inHead} rowId={rowId} checkboxLabel={checkboxLabel} />}

      {children}
    </AppBox>
  );
};

Tr.displayName = 'Table.Tr';

export default Tr;
