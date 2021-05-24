import { FC } from 'react'
import { FlexProps } from '../../Primitives/Layout/Flex';

type Percentage = {
    readonly id: 'search-engine' | 'direct' | 'extern-link' | 'social-network' | 'mail',
    readonly percentage: number,
};

declare const TrafficChart: FC<FlexProps & {
    readonly percentages: Percentage[]
}>

export default TrafficChart
