// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import { FontWeight, LineHeight } from '~ui/Primitives/constants';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import S from './ButtonQuickAction.style';
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon';

type Props = {|
  ...AppBoxProps,
  variantColor?: 'default' | 'danger',
  icon: $Values<typeof ICON_NAME>,
  label: string,
|};

const ButtonQuickAction = React.forwardRef<Props, HTMLButtonElement>(
  ({ variantColor = 'default', icon, label, ...props }: Props, ref) => {
    return (
      <AppBox
        ref={ref}
        as="button"
        type="button"
        display="flex"
        align="center"
        fontSize={3}
        fontWeight={FontWeight.Semibold}
        lineHeight={LineHeight.Base}
        border="none"
        p={1}
        bg="transparent"
        borderRadius="buttonQuickAction"
        variantColor={variantColor}
        css={S[variantColor]}
        {...props}>
        <Icon name={icon} size={ICON_SIZE.M} color="gray.500" />
      </AppBox>
    );
  },
);

ButtonQuickAction.displayName = 'ButtonQuickAction';

export default ButtonQuickAction;
