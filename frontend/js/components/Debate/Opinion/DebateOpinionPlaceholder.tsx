import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { Flex, Card, Tag, Text, Skeleton } from '@cap-collectif/ui'
import { LineHeight } from '~ui/Primitives/constants'
export type DebateOpinionStatus = 'FOR' | 'AGAINST'
type Props = {
  readonly debateOpinionStatus: DebateOpinionStatus
}
export const DebateOpinionPlaceholder = ({ debateOpinionStatus = 'FOR' }: Props): JSX.Element => (
  <Card p={0} bg="white" width="100%">
    <Tag
      variantColor={debateOpinionStatus === 'FOR' ? 'green' : 'red'}
      sx={{
        position: 'absolute',
      }}
    >
      <Text as="span" fontSize={1} lineHeight={LineHeight.SM} fontWeight="700" uppercase>
        <FormattedMessage id={debateOpinionStatus === 'FOR' ? 'opinion.for' : 'opinion.against'} />
      </Text>
    </Tag>
    <Flex direction="column" m={6} mt={10}>
      <Flex direction="row" spacing={6} mb={5}>
        <Skeleton.Circle size={13} />
        <Flex direction="column" flex="1" spacing={2}>
          <Skeleton.Text size="md" width="30%" />
          <Skeleton.Text height="36px" width="100%" />
        </Flex>
      </Flex>

      <Flex direction="column" spacing={4}>
        <Skeleton.Text height="36px" width="60%" />
        <Flex direction="column" spacing={6}>
          <Skeleton.Text height="110px" width="100%" />
          <Skeleton.Text height="150px" width="100%" />
        </Flex>
      </Flex>
    </Flex>
  </Card>
)
export default DebateOpinionPlaceholder
