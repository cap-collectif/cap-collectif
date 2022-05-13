import type { FC } from 'react';
import { Flex, FlexProps, Skeleton } from '@cap-collectif/ui';

interface CountSectionPlaceholderProps extends FlexProps {}

const CountSectionPlaceholder: FC<CountSectionPlaceholderProps> = ({ children, ...props }) => (
    <Flex
        direction="column"
        spacing={7}
        px={6}
        py={4}
        border="normal"
        borderColor="gray.150"
        borderRadius="normal"
        bg="white"
        {...props}>
        <Skeleton.Text size="sm" width="250px" />

        {children}
    </Flex>
);

export default CountSectionPlaceholder;
