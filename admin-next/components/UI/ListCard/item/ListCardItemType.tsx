import type { FC } from 'react';
import { CapUIFontWeight, CapUILineHeight, Text, TextProps } from '@cap-collectif/ui';

export interface ListCardItemTypeProps extends TextProps {}

const ListCardItemType: FC<ListCardItemTypeProps> = ({ children, ...rest }) => (
    <Text
        color="gray.500"
        fontSize={1}
        fontWeight={CapUIFontWeight.Normal}
        lineHeight={CapUILineHeight.Sm}
        {...rest}>
        {children}
    </Text>
);

export default ListCardItemType;
