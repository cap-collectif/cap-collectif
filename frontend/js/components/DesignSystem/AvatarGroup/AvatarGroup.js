// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { cleanChildren } from '~/utils/cleanChildren';
import Avatar, { type AvatarSize } from '~ds/Avatar/Avatar';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';
import type { AppBoxProps, Responsive } from '~ui/Primitives/AppBox.type';
import Text from '~ui/Primitives/Text';

export type Props = {|
  ...AppBoxProps,
  +children?: React.Node,
  +max?: number,
  +size?: AvatarSize,
  +direction?: Responsive<'row' | 'column' | 'row-reverse' | 'column-reverse'>,
  +showNames?: boolean,
  +showCount?: boolean,
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
  showNames = false,
  showCount = false,
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
    <AppBox key={c.props.name} {...margins} zIndex={[computedMax - i, 0]}>
      {React.cloneElement(c, { size, color: 'white', borderColor: 'white', border: 'avatar' })}
    </AppBox>
  ));
  let renderAuthorsNames;
  if (showNames) {
    renderAuthorsNames =
      validChildren.length <= 1 ? (
        <Text
          flex={['100%', 'inherit']}
          fontWeight={400}
          fontSize={14}
          lineHeight="24px"
          color="neutral-gray.900"
          marginLeft={[0, margins.mr * -1]}
          paddingLeft={[0, 2]}
          height="auto"
          display="flex"
          alignItems="center">
          {validChildren[0].props.name}
        </Text>
      ) : (
        <>
          <Text
            flex={['100%', 'inherit']}
            fontWeight={400}
            fontSize={14}
            lineHeight="24px"
            color="neutral-gray.900"
            marginLeft={[0, margins.mr * -1]}
            paddingLeft={[0, 2]}
            height="auto"
            display={['none', 'flex']}
            alignItems="center">
            <FormattedMessage
              id="avatar-group-shownames"
              values={{ name: validChildren[0].props.name, length: validChildren.length - 1 }}
            />
          </Text>
          <Text
            flex={['100%', 'inherit']}
            fontWeight={400}
            fontSize={14}
            lineHeight="24px"
            color="neutral-gray.900"
            marginLeft={[0, margins.mr * -1]}
            paddingLeft={[0, 2]}
            height="auto"
            display={['flex', 'none']}
            alignItems="center">
            {validChildren[0].props.name} +{validChildren.length - 1}
          </Text>
        </>
      );
  }

  return (
    <Flex direction={computedDirection} pr={Math.abs(getMarginForSize(size))} {...rest}>
      {renderAvatarChildren}
      {count > 0 && showCount && (
        <Avatar
          {...margins}
          bg="blue.500"
          color="white"
          borderColor="white"
          border="avatar"
          size={size}
          zIndex={[computedMax + 1, 0]}>
          +{count}
        </Avatar>
      )}
      {showNames && renderAuthorsNames}
    </Flex>
  );
};

export default AvatarGroup;
