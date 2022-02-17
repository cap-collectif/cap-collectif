import type { FC } from 'react';
import { Flex, Skeleton } from '@cap-collectif/ui';

const TabsChartPlaceholder: FC = () => (
    <Flex direction="column" justify="space-between">
        <Flex direction="row" justify="space-between" mb={9}>
            <Skeleton.Text width="20%" height="50px" />
            <Skeleton.Text width="20%" height="50px" />
            <Skeleton.Text width="20%" height="50px" />
            <Skeleton.Text width="20%" height="50px" />
        </Flex>

        <Skeleton.Text width="100%" height="265px" />
    </Flex>
);

export default TabsChartPlaceholder;
