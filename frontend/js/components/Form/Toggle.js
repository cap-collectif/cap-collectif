// @flow
import * as React from 'react';
import cn from 'classnames';
import ToggleUi from '~ui/Toggle/Toggle';
import type { LabelSide } from '~ui/Toggle/Toggle.style';

export type Props = {|
  input: {
    onChange: (SyntheticInputEvent<HTMLInputElement>) => void,
    value: boolean,
  },
  meta?: { touched: boolean, error: ?string },
  label?: string,
  roledescription?: string,
  disabled?: boolean,
  id: string,
  bold?: boolean,
  labelSide?: LabelSide,
  className?: string,
|};

export const Toggle = ({ id, input, label, disabled, labelSide, meta, className, bold }: Props) => (
  <div className={cn('form-group', className)}>
    <ToggleUi
      id={id}
      label={label}
      labelSide={labelSide}
      disabled={disabled}
      onChange={input.onChange}
      checked={!!input.value}
      bold={bold}
    />
    {meta?.touched && meta?.error}
  </div>
);

export default Toggle;
