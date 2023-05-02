import type { FC } from 'react';
import {
    CapUIFontWeight,
    CapUIIcon,
    CapUIIconSize,
    CapUILineHeight,
    Flex,
    FlexProps,
    Icon,
    Text,
} from '@cap-collectif/ui';
import { useSideBarContext } from '@ui/SideBar/SideBar.context';
import SideBarItem from './SideBarItem';
import { AnimatePresence, m as motion } from 'framer-motion';

interface SideBarMenuProps extends FlexProps {
    id: string;
    title: string;
    icon: CapUIIcon;
}

type SubComponents = {
    Item: typeof SideBarItem,
};

const SideBarMenuAnimated = motion(Flex);

export const SideBarMenu: FC<SideBarMenuProps> & SubComponents = ({
    id,
    children,
    title,
    icon,
}) => {
    const { menuOpen, setMenuOpen, fold, toggleFold } = useSideBarContext();
    const isOpen = menuOpen === id;

    return (
        <Flex direction="column" bg={isOpen ? 'gray.800' : 'gray.900'} className="sideBar__menu">
            <Flex
                direction="row"
                as="button"
                type="button"
                align="center"
                justify={fold ? 'space-between' : 'center'}
                px={3}
                py={2}
                onClick={() => {
                    if (!fold) toggleFold();
                    else setMenuOpen(isOpen ? null : id);
                }}
                lineHeight={CapUILineHeight.Base}
                _hover={{
                    '.cap-text, .cap-icon': { color: 'gray.100' },
                    '.sideBar__menu--icon': { color: 'gray.300' },
                }}>
                <Flex direction="row" spacing={2} align="center">
                    <Icon
                        name={icon}
                        size={CapUIIconSize.Md}
                        color={isOpen ? 'gray.300' : 'gray.500'}
                        className="sideBar__menu--icon"
                    />
                    {fold && (
                        <Text
                            fontSize={3}
                            fontWeight={CapUIFontWeight.Semibold}
                            lineHeight={CapUILineHeight.Sm}
                            color={isOpen ? 'blue.100' : 'gray.500'}>
                            {title}
                        </Text>
                    )}
                </Flex>

                {fold && (
                    <Icon
                        name={isOpen ? CapUIIcon.ArrowUpO : CapUIIcon.ArrowDownO}
                        size={CapUIIconSize.Md}
                        color={isOpen ? 'gray.100' : 'gray.500'}
                    />
                )}
            </Flex>

            <AnimatePresence>
                {isOpen && fold && (
                    <SideBarMenuAnimated
                        direction="column"
                        pb={2}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}>
                        {children}
                    </SideBarMenuAnimated>
                )}
            </AnimatePresence>
        </Flex>
    );
};

SideBarMenu.Item = SideBarItem;

export default SideBarMenu;
