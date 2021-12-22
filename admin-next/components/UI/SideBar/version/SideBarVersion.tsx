import type { FC } from 'react';
import { Text, TextProps, CapUILineHeight } from '@cap-collectif/ui';

interface SideBarVersionProps extends TextProps {}

const SideBarVersion: FC<SideBarVersionProps> = ({ children }) => (
    <Text
        color="gray.700"
        lineHeight={CapUILineHeight.Sm}
        textAlign="center"
        position="absolute"
        bottom={5}
        width="100%"
    >
        {children}
    </Text>
);

export default SideBarVersion;
