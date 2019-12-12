// @flow
import React from 'react';
import Toggle from 'react-toggle';

type Props = {|
  checked?: boolean,
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
|};

export default (props: Props) => <Toggle {...props} />;
