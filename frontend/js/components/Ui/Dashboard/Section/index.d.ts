import { FC } from 'react'
import { FlexProps } from '../../Primitives/Layout/Flex';

declare const Section: FC<FlexProps & {
    label: string,
    children: Node
}>

export default Section
