// @flow
type Props = {|
  +when: boolean,
  +wrapper: (children: React$Node) => React$Node,
  +children: React$Node,
|};

export const ConditionalWrapper = ({ when, wrapper, children }: Props) =>
  when === true ? wrapper(children) : children;

export default ConditionalWrapper;
