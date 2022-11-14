import * as React from 'react';
import { Flex, FlexProps } from '@cap-collectif/ui';

interface CardOrgHeaderProps extends FlexProps {}

const CardOrgHeader: React.FC<CardOrgHeaderProps> = ({ children, ...props }) => (
    <Flex
        direction="row"
        bg="gray.100"
        height="96px"
        align="center"
        justify="center"
        overflow="hidden"
        {...props}>
        {children}
    </Flex>
);

export default CardOrgHeader;
