import * as React from 'react';
import {
    CapUILineHeight,
    Icon,
    CapUIIcon,
    CapUIIconSize,
    Flex,
    FlexProps,
    Tag,
} from '@cap-collectif/ui';
import { useIntl } from 'react-intl';

interface SideBarItemProps extends FlexProps {
    href: string
    selected: boolean;
    beta?: boolean;
}

export const SideBarItem: React.FC<SideBarItemProps> = ({ children, selected, href, beta, ...props }) => {
    const intl = useIntl();

    return (
        <Flex
            as="a"
            href={href}
            fontSize={2}
            py={1}
            pl={selected ? 5 : "44px"}
            pr={5}
            lineHeight={CapUILineHeight.Sm}
            color="gray.300"
            _hover={{
                color: 'blue.100',
            }}
            align="center"
            className="sideBar__subItem"
            {...props}
        >
            {selected && <Icon name={CapUIIcon.MenuArrow} size={CapUIIconSize.Xs} />}
            {children}
            {beta && (
                <Tag variantColor="aqua">
                    <Tag.Label>{intl.formatMessage({ id: 'global.beta' })}</Tag.Label>
                </Tag>
            )}
        </Flex>
    );
}

export default SideBarItem;
