import { FC } from 'react'
import { FlexProps } from '../../Primitives/Layout/Flex';

type Percentage = {
    readonly id: string,
    readonly label: string,
    readonly value: number,
};

declare const PieChart: FC<FlexProps & {
    readonly percentages: Percentage[]
}>

export default PieChart
