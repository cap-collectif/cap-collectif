// @flow
import * as React from 'react';
import { Menu as HeadlessMenu } from '@headlessui/react';
import styled from 'styled-components';
import css from '@styled-system/css';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import Flex from '~ui/Primitives/Layout/Flex';

type RenderProps = (props: { +active: boolean, +disabled: boolean }) => React.Node;

type Props = {|
  ...AppBoxProps,
  +disabled?: boolean,
  +children: RenderProps | React.Node,
|};

const MenuListItemInner = styled(Flex).attrs(props => ({
  bg: props.active ? 'gray.150' : 'transparent',
}))`
  &:hover {
    cursor: pointer;
    &[disabled] {
      user-select: none;
      cursor: not-allowed;
    }
  }
  &:active,
  &:focus {
    outline: none;
  }
`;

const MenuListItem = ({ disabled, ...props }: Props) => {
  return (
    <HeadlessMenu.Item disabled={disabled}>
      {({ active }) => (
        <MenuListItemInner
          disabled={disabled}
          active={active}
          p={3}
          align="center"
          borderBottom="normal"
          borderColor="gray.150"
          css={p =>
            css({
              '&:last-of-type': {
                borderBottom: 0,
              },
              '&[disabled]': {
                color: p.color ?? 'gray.500',
              },
            })
          }
          {...props}
        />
      )}
    </HeadlessMenu.Item>
  );
};

MenuListItem.displayName = 'Menu.ListItem';

export default MenuListItem;
