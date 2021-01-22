// @flow
import * as React from 'react';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';

type Props = {|
  ...AppBoxProps,
  children: React.Element<*>,
|};

export const POPOVER_TRIGGER_TYPE: 'PopoverTrigger' = 'PopoverTrigger';

const PopoverTrigger = React.forwardRef<Props, HTMLElement>(({ children, ...props }: Props, ref) =>
  React.cloneElement(children, { ref, ...props }),
);

PopoverTrigger.name = POPOVER_TRIGGER_TYPE;
PopoverTrigger.displayName = 'Popover.Trigger';

export default PopoverTrigger;
