// @flow
import * as React from 'react';
import { Menu as HeadlessMenu } from '@headlessui/react';
import styled from 'styled-components';
import css from '@styled-system/css';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import type { ButtonProps } from '~ds/Button/Button';
import Flex from '~ui/Primitives/Layout/Flex';
import { useMenu } from '~ds/Menu/Menu.context';

export type Props = {|
  ...AppBoxProps,
  ...ButtonProps,
  +disabled?: boolean,
  +children: React.Node,
|};

const MenuListItemInner = styled(Flex).attrs(props => ({
  bg: props.active ? 'gray.100' : 'transparent',
}))`
  pointer-events: all;
  &[disabled] {
    pointer-events: none;
  }
  &:hover {
    cursor: pointer;
    &[disabled] {
      pointer-events: none;
      cursor: not-allowed;
    }
  }
  &:active,
  &:focus {
    outline: none;
  }
`;

const MenuListItem = ({ disabled, children, ...props }: Props) => {
  const { closeOnSelect } = useMenu();
  return (
    <HeadlessMenu.Item closeOnSelect={closeOnSelect} disabled={disabled}>
      {({ active }) => (
        <MenuListItemInner
          disabled={disabled}
          active={active}
          px={3}
          py={2}
          align="center"
          lineHeight="base"
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
          {...props}>
          {children}
        </MenuListItemInner>
      )}
    </HeadlessMenu.Item>
  );
};

MenuListItem.displayName = 'Menu.ListItem';

export default MenuListItem;
