// @flow
import React from 'react';
import Toggle from '~/components/Form/Toggle';

type Props = {|
  checked?: ?boolean,
  defaultChecked?: boolean,
  name?: string,
  value?: string,
  id?: string,
  icons?: string,
  'aria-labelledby'?: string,
  'aria-label'?: string,
  disabled?: boolean,
  onChange?: () => void,
  onFocus?: () => void,
  onBlur?: () => void,
  className?: string,
|};

export default ({ onChange, checked, id, disabled, ...rest }: Props) => {
  const input = { onChange, value: checked || false };
  return <Toggle input={input} id={id} label={rest['aria-label']} disabled={disabled} />;
};
