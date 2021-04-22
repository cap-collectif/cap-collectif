// @flow

export type Item = {|
  +active?: boolean,
  +hasEnabledFeature?: boolean,
  +id: number | string,
  +link?: string,
  +title: string,
  +children: Item[],
|};
