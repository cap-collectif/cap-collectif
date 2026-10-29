import { Box, Button, Flex, InfoMessage, Text } from '@cap-collectif/ui'
import * as React from 'react'
import { useIntl } from 'react-intl'

type Props = {
  readonly members: ReadonlyArray<{ readonly key: string; readonly label: string }>
  readonly refusingCount: number
  readonly hasNext: boolean
  readonly isLoadingNext: boolean
  readonly loadNext: () => void
}

/**
 * Members who consented to receive internal communications, the only ones a campaign is sent to.
 */
const MembersList: React.FC<Props> = ({ members, refusingCount, hasNext, isLoadingNext, loadNext }) => {
  const intl = useIntl()

  return (
    <Flex direction="column" spacing={4}>
      {refusingCount > 0 ? (
        <InfoMessage variant="info" mb={2}>
          <InfoMessage.Title>{intl.formatMessage({ id: 'mailingList-refusing-members-count' })}</InfoMessage.Title>
          <InfoMessage.Content>
            {intl.formatMessage({ id: 'mailingList-refusing-members' }, { num: refusingCount })}
          </InfoMessage.Content>
        </InfoMessage>
      ) : null}

      <Box as="ul" p={0} m={0} maxHeight="300px" overflowY="auto" sx={{ listStyle: 'none' }}>
        {members.map(member => (
          <Text as="li" key={member.key} mb={3} color="gray.900">
            {member.label}
          </Text>
        ))}
      </Box>

      {hasNext ? (
        <Button variant="tertiary" variantColor="primary" isLoading={isLoadingNext} onClick={loadNext}>
          {intl.formatMessage({ id: 'global.more' })}
        </Button>
      ) : null}
    </Flex>
  )
}

export default MembersList
