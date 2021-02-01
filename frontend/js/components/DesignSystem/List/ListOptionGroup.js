// @flow
import * as React from 'react';
import { useMemo } from 'react';
import AppBox from '~ui/Primitives/AppBox';
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
      <AppBox display="flex" flexDirection="column" {...props}>
        {children}
      </AppBox>
    </ListOptionGroupContext.Provider>
  );
};

ListOptionGroup.Item = ListOptionGroupItem;

export default ListOptionGroup;
