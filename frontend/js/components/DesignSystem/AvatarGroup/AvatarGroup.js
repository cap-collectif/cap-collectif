// @flow
import * as React from 'react';
import { cleanChildren } from '~/utils/cleanChildren';
import Avatar, { type AvatarSize } from '~ds/Avatar/Avatar';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';
import type { AppBoxProps, Responsive } from '~ui/Primitives/AppBox.type';

type Props = {|
  ...AppBoxProps,
  +children?: React.Node,
  +max?: number,
  +size?: AvatarSize,
  +direction?: Responsive<'row' | 'column' | 'row-reverse' | 'column-reverse'>,
|};

const getMarginForSize = (size: AvatarSize): number => {
  switch (size) {
    case 'xs':
    case 'sm':
      return -2;
    case 'md':
    default:
      return -3;
    case 'lg':
      return -4;
    case 'xl':
      return -7;
  }
};

export const AvatarGroup = ({
  children,
  max,
  flexDirection,
  direction,
  size = 'md',
  stacked = false,
  ...rest
}: Props) => {
  const validChildren = cleanChildren(children);
  const computedDirection = flexDirection ?? direction ?? 'row';
  const margins = {
    // $FlowFixMe flow does not seem to like conditional computed property but it's totally fine
    [computedDirection === 'row' ? 'mr' : 'mb']: getMarginForSize(size),
  };
  const computedMax = max ?? validChildren.length;
  const count = validChildren.length - computedMax;
  const renderAvatarChildren = validChildren.slice(0, computedMax).map((c, i) => (
    <AppBox {...margins} style={{ zIndex: stacked ? computedMax - i : undefined }} key={i}>
      {React.cloneElement(c, { size, color: 'white', borderColor: 'white', border: 'avatar' })}
    </AppBox>
  ));
  return (
    <Flex direction={computedDirection} pr={Math.abs(getMarginForSize(size))} {...rest}>
      {renderAvatarChildren}
      {count > 0 && (
        <Avatar
          {...margins}
          bg="blue.500"
          color="white"
          borderColor="white"
          border="avatar"
          size={size}
          style={{ zIndex: stacked ? -computedMax - 1 : undefined }}>
          +{count}
        </Avatar>
      )}
    </Flex>
  );
};

export default AvatarGroup;
