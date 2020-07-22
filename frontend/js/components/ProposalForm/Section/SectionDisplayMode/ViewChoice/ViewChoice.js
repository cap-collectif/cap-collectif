// @flow
import * as React from 'react';
import { Container } from './ViewChoice.style';
import type { NativeInput } from '~ui/Form/Input/common';
import Toggle, { type Tooltip } from '~ui/Toggle/Toggle';

type Props = {|
  input: NativeInput,
  label: string,
  id: string,
  hasError: boolean,
  onChange: () => void,
  icon: React.Node,
  children?: React.Node,
  isOpen?: boolean,
  tooltip: ?Tooltip,
  meta: {
    error: ?string,
  },
|};

const ViewChoice = ({ label, input, id, children, isOpen, icon, hasError, tooltip }: Props) => (
  <Container isOpen={isOpen} hasError={hasError}>
    <div className="head">
      {icon}
      <Toggle
        id={id}
        label={label}
        checked={((input?.value: any): ?boolean)}
        name={input.name}
        onChange={input.onChange}
        tooltip={tooltip}
      />
    </div>

    {children}
  </Container>
);

export default ViewChoice;
