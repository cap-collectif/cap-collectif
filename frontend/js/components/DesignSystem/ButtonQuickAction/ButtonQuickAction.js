// @flow
import * as React from 'react';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import S from './ButtonQuickAction.style';
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon';
import Button from '~ds/Button/Button';

type Props = {|
  ...AppBoxProps,
  variantColor: 'primary' | 'danger',
  icon: $Values<typeof ICON_NAME>,
  label: string,
|};

const ButtonQuickAction = React.forwardRef<Props, HTMLElement>(
  ({ variantColor, icon, label, ...props }: Props, ref) => {
    return (
      <Button ref={ref} p={1} borderRadius="buttonQuickAction" css={S[variantColor]} {...props}>
        <Icon name={icon} size={ICON_SIZE.MD} color="gray.500" />
      </Button>
    );
  },
);

ButtonQuickAction.displayName = 'ButtonQuickAction';

export default ButtonQuickAction;
