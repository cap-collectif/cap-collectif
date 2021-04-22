// @flow

export type Item = {|
  +active: boolean,
  +hasEnabledFeature: boolean,
  +id: number,
  +link: string,
  +title: string,
  +children: Item[],
|};
