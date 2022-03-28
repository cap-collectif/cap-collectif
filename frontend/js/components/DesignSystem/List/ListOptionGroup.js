// @flow
import * as React from 'react';
import { useMemo } from 'react';
import { Flex } from '@cap-collectif/ui';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import type { Context } from '~ds/List/ListOptionGroup.context';
import { ListOptionGroupContext } from '~ds/List/ListOptionGroup.context';
import ListOptionGroupItem from '~ds/List/ListOptionGroupItem';

type Props = {|
  ...AppBoxProps,
  +type: 'checkbox' | 'radio',
  +value?: string | string[],
  +onChange?: (newValue: string | string[]) => void,
|};

export const ListOptionGroup = ({ children, type, value, onChange, ...props }: Props) => {
  const context = useMemo<Context>(
    () => ({
      onChange,
      value,
      type,
    }),
    [onChange, value, type],
  );

  return (
    <ListOptionGroupContext.Provider value={context}>
      <Flex direction="column" {...props}>
        {children}
      </Flex>
    </ListOptionGroupContext.Provider>
  );
};

ListOptionGroup.Item = ListOptionGroupItem;

export default ListOptionGroup;
