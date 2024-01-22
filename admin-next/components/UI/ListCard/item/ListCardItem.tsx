import type { FC } from 'react';
import { CapUIRadius, Flex, FlexProps } from '@cap-collectif/ui';
import ListCardItemLabel from '@ui/ListCard/item/ListCardItemLabel';
import ListCardItemType from '@ui/ListCard/item/ListCardItemType';

export interface ListCardItemProps extends FlexProps {}

type SubComponents = {
    Label: typeof ListCardItemLabel;
    Type: typeof ListCardItemType;
};

const ListCardItem: FC<ListCardItemProps> & SubComponents = ({ children, ...rest }) => (
    <Flex
        direction="row"
        align="center"
        justify="space-between"
        px={4}
        py={3}
        borderRadius={CapUIRadius.Normal}
        bg="gray.100"
        borderBottom="normal"
        borderColor="gray.200"
        _hover={{
            bg: 'white',
        }}
        sx={{
            '&:last-child': {
                border: 'none',
            },
        }}
        {...rest}>
        {children}
    </Flex>
);

ListCardItem.Label = ListCardItemLabel;
ListCardItem.Type = ListCardItemType;

export default ListCardItem;
