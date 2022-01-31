import type { FC } from 'react';
import { Flex, FlexProps } from '@cap-collectif/ui';

interface CardSSOBodyProps extends FlexProps {}

const CardSSOBody: FC<CardSSOBodyProps> = ({ children, ...props }) => (
    <Flex direction="row" p={6} justify="space-between" align="center" {...props}>
        {children}
    </Flex>
);

export default CardSSOBody;
