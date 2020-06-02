// @flow
import * as React from 'react';

export type DropdownValueAddedRemovedType = {
  added: $ReadOnlyArray<string>,
  removed: $ReadOnlyArray<string>,
  values: $ReadOnlyArray<string>,
  all: $ReadOnlyArray<string>,
};
export type DropdownValueType =
  | string
  | $ReadOnlyArray<string>
  | DropdownValueAddedRemovedType
  | null;

export type DropdownOnChangeType = (
  value: any,
) => void | ((value: DropdownValueAddedRemovedType) => void) | Promise<any>;
export type DropdownMode = 'normal' | 'add-remove';

export type Context = {|
  +mode: DropdownMode,
  +isMultiSelect: boolean,
  +allValues?: $ReadOnlyArray<string>,
  +value?: DropdownValueType,
  +initialValue?: DropdownValueType,
  +setInitialValue: (value: ?$ReadOnlyArray<string>) => void,
  +onChange?: DropdownOnChangeType,
  +disabled?: boolean,
|};

export const DropdownSelectContext = React.createContext<Context>({
  mode: 'normal',
  value: null,
  allValues: [],
  setInitialValue: () => {},
  initialValue: null,
  isMultiSelect: false,
});
