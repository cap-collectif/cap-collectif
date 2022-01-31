import type { FC } from 'react';
import { Flex, FlexProps } from '@cap-collectif/ui';
import ListCardItem from '@ui/ListCard/item/ListCardItem';
import ListCardSubItem from '@ui/ListCard/subItem/ListCardSubItem';

export interface ListCardProps extends FlexProps {}

type SubComponents = {
    Item: typeof ListCardItem,
    SubItem: typeof ListCardSubItem,
};

export const ListCard: FC<ListCardProps> & SubComponents = ({ children, ...rest }) => (
    <Flex
        direction="column"
        borderRadius="8px"
        overflow="hidden"
        border="normal"
        borderColor="gray.200"
        {...rest}>
        {children}
    </Flex>
);

ListCard.Item = ListCardItem;
ListCard.SubItem = ListCardSubItem;

export default ListCard;
