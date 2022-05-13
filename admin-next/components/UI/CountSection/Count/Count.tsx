import type { FC } from 'react';
import { CapUIFontWeight, CapUILineHeight, Text, TextProps } from '@cap-collectif/ui';
import { formatBigNumber } from '@utils/format-number';

interface CountProps extends TextProps {}

const Count: FC<CountProps> = ({ children, ...rest }: CountProps) => (
    <Text
        fontSize={5}
        lineHeight={CapUILineHeight.M}
        fontWeight={CapUIFontWeight.Semibold}
        className="count-section__count"
        {...rest}>
        {typeof children === "string" ? formatBigNumber(children) : children}
    </Text>
);

export default Count;
