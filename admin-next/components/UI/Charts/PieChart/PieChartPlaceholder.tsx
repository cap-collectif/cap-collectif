import type { FC } from 'react';
import { Flex, Skeleton } from '@cap-collectif/ui';

const PieChartPlaceholder: FC = () => (
    <Flex direction="row" justify="space-between">
        <Flex direction="column" spacing={3}>
            <Skeleton.Text size="md" width="225px" />
            <Skeleton.Text size="md" width="225px" />
            <Skeleton.Text size="md" width="225px" />
            <Skeleton.Text size="md" width="225px" />
            <Skeleton.Text size="md" width="225px" />
        </Flex>

        <Skeleton.Circle size="130px" />
    </Flex>
);

export default PieChartPlaceholder;
