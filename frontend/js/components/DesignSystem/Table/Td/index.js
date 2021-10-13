// @flow
import * as React from 'react';
import css from '@styled-system/css';
import cn from 'classnames';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import { useTable } from '~ds/Table/context';
import SkeletonText from '~ds/Skeleton/text';
import { formatBigNumber } from '~/utils/bigNumberFormatter';

type TdProps = {|
  ...AppBoxProps,
  isNumeric?: boolean,
  visibleOnHover?: boolean,
  noPlaceholder?: boolean,
  children: ?string | ?React.Node,
|};

const styles = css({
  a: {
    textDecoration: 'none ',
    color: 'gray.900',

    '&:hover': {
      textDecoration: 'underline',
      color: 'blue.500',
    },
  },
});

const Td = ({
  isNumeric,
  visibleOnHover,
  noPlaceholder,
  children,
  ...props
}: TdProps): React.Node => {
  const { isLoading } = useTable();
  const isEmpty: boolean = !isLoading && !children;

  return (
    <AppBox
      as="td"
      py={visibleOnHover ? 2 : 3}
      px={4}
      textAlign={isNumeric ? 'right' : 'left'}
      style={{ whiteSpace: isNumeric ? 'nowrap' : 'initial' }}
      className={cn({ 'visible-on-hover': visibleOnHover })}
      css={styles}
      lineHeight="base"
      {...props}>
      {isEmpty && !visibleOnHover && '-'}
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
