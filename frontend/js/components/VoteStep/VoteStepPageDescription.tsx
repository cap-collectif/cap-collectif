import { Card, Heading, Text } from '@cap-collectif/ui'
import * as React from 'react'

import DatesInterval from '../Utils/DatesInterval'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'

type Props = {
  title: string
  body: string
  timeRange?: { startAt?: String; endAt?: String }
}

export const VoteStepPageDescription = ({ title, body, timeRange }: Props) => {
  return (
    // We use className="container" to match the old bootstrap style. Not a huge fan, but for now it'll work
    <Card border="none" bg="white" m={[0, 8]} p={8} mb={[0, 0]} fontSize={3} className="container">
      <Heading as="h3" mb={2}>
        {title}
      </Heading>
      {timeRange?.startAt || timeRange?.endAt ? (
        <DatesInterval startAt={timeRange.startAt as string} endAt={timeRange.endAt as string} fullDay />
      ) : null}
      <Text lineHeight="initial" mt={2}>
        <WYSIWYGRender value={body} />
      </Text>
    </Card>
  )
}
export default VoteStepPageDescription
