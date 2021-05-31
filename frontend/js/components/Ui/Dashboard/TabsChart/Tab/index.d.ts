import { FC } from 'react'
import { LineChart } from '../LineChart/index';

declare const Tab: FC<LineChart & {
    id: string
    count: number
    active?: boolean
    onClick?: () => void
}>

export default Tab
