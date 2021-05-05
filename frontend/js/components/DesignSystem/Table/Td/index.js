// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import { useTable } from '~ds/Table/context';
import SkeletonText from '~ds/Skeleton/text';
import { formatBigNumber } from '~/utils/bigNumberFormatter';

type TdProps = {|
  ...AppBoxProps,
  isNumeric?: boolean,
  noPlaceholder?: boolean,
  children: string | React.Node,
|};

const Td = ({ isNumeric, noPlaceholder, children, ...props }: TdProps): React.Node => {
  const { isLoading } = useTable();
  const isEmpty: boolean = !isLoading && !children;

  return (
    <AppBox
      as="td"
      py={3}
      px={4}
      textAlign={isNumeric ? 'right' : 'left'}
      style={{ whiteSpace: isNumeric ? 'nowrap' : 'initial' }}
      {...props}>
      {isEmpty && '-'}
      {isLoading && !noPlaceholder ? (
        <SkeletonText size="md" width="100%" />
      ) : isNumeric && typeof children === 'string' ? (
        formatBigNumber(children)
      ) : (
        children
      )}
    </AppBox>
  );
};

Td.displayName = 'Table.Td';

export default Td;
