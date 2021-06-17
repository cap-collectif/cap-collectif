import { FC } from 'react'
import { AppBoxProps } from '../../Primitives/AppBox';

type Data = {
    readonly date: string,
    readonly value: number,
};

declare const LineChart: FC<AppBoxProps & {
    readonly withGrid?: boolean,
    readonly withAxis?: boolean,
    readonly withTooltip?: boolean,
    readonly data: Data,
    readonly label: string,
}>

export default LineChart
