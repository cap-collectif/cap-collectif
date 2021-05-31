import { FC } from 'react'
import { AppBoxProps } from '../../Primitives/AppBox';

type Data = {
    readonly date: string,
    readonly value: string,
};

declare const LineChart: FC<AppBoxProps & {
    readonly withGrid?: boolean,
    readonly withAxis?: boolean,
    readonly data: Data,
    readonly label: string,
}>

export default LineChart
