// @flow
import * as React from 'react';
import { forwardRef } from 'react';
import styled from 'styled-components';
import { m as motion } from 'framer-motion';
import { Menu } from 'reakit/Menu';
import { useMenu } from './Menu.context';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import { LAYOUT_TRANSITION_SPRING } from '~/utils/motion';
import Flex from '~ui/Primitives/Layout/Flex';

type Props = {|
  ...AppBoxProps,
|};

const MenuItems = styled(motion.custom(Flex)).attrs(props => ({
  direction: 'column',
  minWidth: '200px',
  bg: 'white',
  boxShadow: 'medium',
  mt: 2,
  border: 'normal',
  borderColor: 'gray.200',
  borderRadius: 'card',
  zIndex: 100,
  overflow: 'hidden',
  ...props,
}))`
  &:active,
  &:focus {
    outline: none;
  }
`;

const MenuList = forwardRef<Props, HTMLElement>(
  ({ children, ariaLabel, ariaLabelledby, ...props }: Props, ref) => {
    const { reakitMenu, hideOnClickOutside } = useMenu();
    const label = ariaLabel ?? props['aria-label'] ?? undefined;
    const labelledby = ariaLabelledby ?? props['aria-labelledby'] ?? undefined;
    return (
      <Menu
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        }}
        aria-label={label}
        aria-labelledby={labelledby}
        hideOnClickOutside={hideOnClickOutside}
        {...reakitMenu}
        style={{ outline: 'none' }}
        as={MenuItems}
        ref={ref}
        zIndex={1000}
        {...props}
        initial="hidden"
        animate={reakitMenu.visible ? 'visible' : 'hidden'}
        transition={LAYOUT_TRANSITION_SPRING}>
        {children}
      </Menu>
    );
  },
);

MenuList.displayName = 'Menu.List';

export default MenuList;
