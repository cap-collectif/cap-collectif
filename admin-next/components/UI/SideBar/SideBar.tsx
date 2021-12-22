import * as React from 'react';
import { motion } from 'framer-motion';
import { Flex, FlexProps } from '@cap-collectif/ui';
import SideBarHeader from './header/SideBarHeader';
import SideBarMenu from './menu/SideBarMenu';
import SideBarItem from './item/SideBarItem';
import SideBarVersion from './version/SideBarVersion';
import { useSideBarContext } from '@ui/SideBar/SideBar.context';

export interface SideBarProps extends FlexProps {}

type SubComponents = {
    Header: typeof SideBarHeader,
    Menu: typeof SideBarMenu,
    Item: typeof SideBarItem,
    Version: typeof SideBarVersion,
};

const SideBarAnimated = motion.custom(Flex);

export const SideBar: React.FC<SideBarProps> & SubComponents = ({ children }) => {
    const { fold } = useSideBarContext();

    return (
        <SideBarAnimated
            direction="column"
            bg="gray.900"
            width={fold ? '224px' : '50px'}
            flexShrink={0}
            height="100%"
            className="sideBar"
            position="relative"
            overflow="hidden"
            initial={{ width: fold ? '224px' : '50px' }}
            animate={{ width: fold ? '224px' : '50px' }}
            transition={{ ease: 'easeInOut', duration: 0.3 }}>
            {children}
        </SideBarAnimated>
    );
};

SideBar.Header = SideBarHeader;
SideBar.Menu = SideBarMenu;
SideBar.Item = SideBarItem;
SideBar.Version = SideBarVersion;

export default SideBar;
