import { FC } from 'react'
import { Text } from '@cap-collectif/ui'

export interface TestProps {
  readonly text: string
}

export const Test: FC<TestProps> = ({ text }) => <Text>{text}</Text>

export default Test
