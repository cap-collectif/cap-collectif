import { Skeleton, Flex } from '@cap-collectif/ui';

const ShieldPlaceholder = () => (
    <Flex direction="column" p={6} spacing={6} bg="white" borderRadius="8px" width="30%">
        <Skeleton.Text width="25%" size="lg" />

        <Flex direction="row" justify="space-between">
            <Flex direction="column" spacing={1} flex={1}>
                <Skeleton.Text width="25%" size="lg" />
                <Skeleton.Text width="90%" size="sm" />
                <Skeleton.Text width="50%" size="sm" />
            </Flex>
            <Skeleton.Text width="32px" height="16px" borderRadius="10px" />
        </Flex>

        <Flex direction="row" justify="space-between">
            <Flex direction="column" spacing={1} flex={1}>
                <Skeleton.Text width="25%" size="lg" />
                <Skeleton.Text width="90%" size="sm" />
                <Skeleton.Text width="50%" size="sm" />
            </Flex>
            <Skeleton.Text width="32px" height="16px" borderRadius="10px" />
        </Flex>
    </Flex>
);

export default ShieldPlaceholder;
