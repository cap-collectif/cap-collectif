import { FC } from 'react'
import { FlexProps } from '../../Primitives/Layout/Flex';

declare const ViewChart: FC<FlexProps & {
    readonly truncate?: number,
    readonly total: number,
    readonly count: number,
    readonly level: number,
    readonly label: string,
}>

export default ViewChart
