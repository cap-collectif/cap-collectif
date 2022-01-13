// @flow
import * as React from 'react';
import cn from 'classnames';
import ToggleUi from '~ui/Toggle/Toggle';
import type { LabelSide } from '~ui/Toggle/Toggle.style';

export type Props = {|
  input: {
    onChange: (SyntheticInputEvent<HTMLInputElement>) => void,
    value: boolean,
    name?: string,
  },
  meta?: { touched: boolean, error: ?string },
  label?: string,
  roledescription?: string,
  helpText?: string,
  disabled?: boolean,
  id: string,
  bold?: boolean,
  labelSide?: LabelSide,
  className?: string,
  toggleClassName?: string,
|};

export const Toggle = ({
  id,
  input,
  label,
  disabled,
  labelSide,
  meta,
  className,
  toggleClassName,
  bold,
  helpText,
}: Props) => (
  <div className={cn('form-group', className)}>
    <ToggleUi
      id={id}
      name={input.name}
      className={toggleClassName}
      label={label}
      helpText={helpText}
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
