import type { FC } from 'react';
import { Flex, FlexProps } from '@cap-collectif/ui';

export interface ListCardSubItemProps extends FlexProps {}

const ListCardSubItem: FC<ListCardSubItemProps> = ({ children, ...rest }) => (
    <Flex
        direction="row"
        align="center"
        px={4}
        py={3}
        bg="white"
        borderBottom="normal"
        borderColor="gray.200"
        {...rest}>
        {children}
    </Flex>
);

export default ListCardSubItem;
