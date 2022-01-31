import type { FC } from 'react';
import { Flex, FlexProps } from '@cap-collectif/ui';

interface CardSSOHeaderProps extends FlexProps {}

const CardSSOHeader: FC<CardSSOHeaderProps> = ({ children, ...props }) => (
    <Flex direction="row" bg="gray.100" height="96px" align="center" justify="center" {...props}>
        {children}
    </Flex>
);

export default CardSSOHeader;
