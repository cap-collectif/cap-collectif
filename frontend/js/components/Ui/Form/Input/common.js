// @flow

export type CommonPropsInput = {|
  id: string,
  name: string,
  value?: string | number,
  disabled?: boolean,
  readonly?: boolean,
  required?: boolean,
  placeholder?: string,
  label?: string,
  className?: string,
  maxlength?: number,
  minlength?: number,
  onChange?: Function,
  onBlur?: Function,
  onFocus?: Function,
|};

export type NativeInput = {|
  name: string,
  onBlur: () => void,
  onChange: () => void,
  onDragStart: () => void,
  onDrop: () => void,
  onFocus: () => void,
  value: ?string | ?number | ?boolean,
  checked?: ?boolean,
|};
