// @flow
import * as React from 'react';
import { Menu as HeadlessMenu } from '@headlessui/react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import Flex from '~ui/Primitives/Layout/Flex';
import { useMenu } from '~ds/Menu/Menu.context';
import { LAYOUT_TRANSITION_SPRING } from '~/utils/motion';

type RenderProps = (props: { +open: boolean }) => React.Node;

type Props = {|
  ...AppBoxProps,
  +align?: 'left' | 'right',
  +children: RenderProps | React.Node,
|};

export const MENU_LIST_TYPE: 'MenuList' = 'MenuList';

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

const MenuList = React.forwardRef<Props, HTMLElement>(
  ({ children, align = 'right', ...props }: Props, ref) => {
    const { open, closeOnSelect } = useMenu();

    return (
      <AnimatePresence>
        {open && (
          <HeadlessMenu.Items
            static
            closeOnSelect={closeOnSelect}
            ref={ref}
            as={MenuItems}
            align={align}
            {...props}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={LAYOUT_TRANSITION_SPRING}
            exit={{ opacity: 0, y: -10 }}>
            {children}
          </HeadlessMenu.Items>
        )}
      </AnimatePresence>
    );
  },
);

// When using forwardRef, it does not understand defaultProps but it is working
// I need those defaultProps in `Menu.js` component to filter the children and wrap them with Tippy to
// have a correct positionnable dropdown element but keeping the same Menu component API
// $FlowFixMe
MenuList.defaultProps = {
  __type: MENU_LIST_TYPE,
};

MenuList.displayName = 'Menu.List';

export default MenuList;
