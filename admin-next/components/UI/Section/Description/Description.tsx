import type { FC } from 'react';
import { Text, TextProps } from '@cap-collectif/ui';

interface DescriptionProps extends TextProps {}

const Description: FC<DescriptionProps> = ({ children, ...rest }: DescriptionProps) => (
    <Text color="gray.600" {...rest}>
        {children}
    </Text>
);

export default Description;
