// @flow
import * as React from 'react';
import Flex, { type Props as FlexProps } from '~ui/Primitives/Layout/Flex';
import AppBox from '~ui/Primitives/AppBox';
import { cleanChildren } from '~/utils/cleanChildren';

type Props = {|
  ...FlexProps,
  separator: string,
|};

const isLastChild = (index, children) => index + 1 === React.Children.count(children);

export const InlineList = ({ children, separator, spacing = 1, ...props }: Props) => {
  const validChildren = cleanChildren(children);

  return (
    <Flex direction="row" spacing={spacing} align="center" {...props}>
      {React.Children.map(validChildren, (child, idx) => (
        <>
          {child}

          {!isLastChild(idx, children) && (
            <AppBox as="span" marginLeft={spacing} aria-hidden>
              {separator}
            </AppBox>
          )}
        </>
      ))}
    </Flex>
  );
};

InlineList.displayName = 'InlineList';

export default InlineList;
