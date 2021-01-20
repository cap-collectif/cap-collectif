// @flow
import * as React from 'react';
import type { Context } from '~ui/List/PickableList/context';
import { PickableListContext } from '~ui/List/PickableList/context';

export const usePickableList = (): Context => {
  const context = React.useContext(PickableListContext);
  if (!context) {
    throw new Error(
      `You can't use the PickableListContext outsides a PickableList.Provider component.`,
    );
  }
  return context;
};
