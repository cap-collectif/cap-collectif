import type { FC } from 'react';
import { CapUIIcon, CapUIIconSize, Flex, Box, Icon, FlexProps } from '@cap-collectif/ui';
import { useSideBarContext } from '@ui/SideBar/SideBar.context';

interface SideBarHeaderProps extends FlexProps {}

const SideBarHeader: FC<SideBarHeaderProps> = ({ children }) => {
    const { toggleFold, fold } = useSideBarContext();

    return (
        <Flex
            direction="row"
            justify={fold ? 'space-between' : 'center'}
            color="blue.100"
            bg="gray.900"
            p={4}
            boxShadow="big"
            zIndex={1}>
            {fold && children}

            <Box as="button" type="button" onClick={toggleFold}>
                <Icon name={CapUIIcon.Burger} size={CapUIIconSize.Md} />
            </Box>
        </Flex>
    );
};

export default SideBarHeader;
