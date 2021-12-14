import type { FC } from 'react';
import { Text, TextProps, CapUIFontWeight, headingStyles } from '@cap-collectif/ui';

interface TitleProps extends TextProps {}

const Title: FC<TitleProps> = ({ children, ...rest }) => (
    <Text {...headingStyles.h4} fontWeight={CapUIFontWeight.Semibold} color="blue.800" {...rest}>
        {children}
    </Text>
);

export default Title;
