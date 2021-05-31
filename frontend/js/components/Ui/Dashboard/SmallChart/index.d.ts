import { FC } from 'react'
import { LineChart } from '../LineChart/index';

declare const SmallChart: FC<LineChart & {
    readonly count: number
}>

export default SmallChart
