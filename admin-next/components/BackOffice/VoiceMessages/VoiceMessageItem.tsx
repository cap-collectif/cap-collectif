import { ButtonGroup, ButtonQuickAction, CapUIIcon, CapUIIconSize, Flex, Table, Tag, Text } from '@cap-collectif/ui'
import type { VoiceMessageItem_vocal$key } from '@relay/VoiceMessageItem_vocal.graphql'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { getVoiceMessageFileUrl } from './utils'

const FRAGMENT = graphql`
  fragment VoiceMessageItem_vocal on VocalContribution {
    id
    completionStatus
    createdAt
    user {
      username
      email
    }
    participant {
      firstname
      lastname
      username
      email
    }
  }
`

type Props = {
  vocal: VoiceMessageItem_vocal$key
  isPlaying: boolean
  onTogglePlay: (vocalId: string) => void
}

const VoiceMessageItem: React.FC<Props> = ({ vocal: fragmentKey, isPlaying, onTogglePlay }) => {
  const intl = useIntl()
  const vocal = useFragment(FRAGMENT, fragmentKey)
  const { user, participant } = vocal

  const participantName = [participant?.firstname, participant?.lastname].filter(Boolean).join(' ')
  const authorName =
    user?.username || participantName || participant?.username || intl.formatMessage({ id: 'global.anonymous' })
  // A contribution without user was submitted anonymously, by a participant
  const authorDetails = user
    ? user.email
    : [participant?.email, intl.formatMessage({ id: 'admin.voice-messages.author.participant' })]
        .filter(Boolean)
        .join(' · ')
  const date = intl.formatDate(vocal.createdAt, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const isCompleted = vocal.completionStatus === 'COMPLETED'

  return (
    <>
      <Table.Td>
        <Tag variantColor={isCompleted ? 'success' : 'warning'}>
          {intl.formatMessage({
            id: isCompleted
              ? 'admin.voice-messages.status.completed'
              : 'admin.voice-messages.status.missing-requirements',
          })}
        </Tag>
      </Table.Td>
      <Table.Td>
        <time dateTime={vocal.createdAt}>{date}</time>
      </Table.Td>
      <Table.Td>
        <Flex direction="column">
          <Text truncate={64}>{authorName}</Text>
          {authorDetails ? (
            <Text fontSize={1} color="gray.500" truncate={128}>
              {authorDetails}
            </Text>
          ) : null}
        </Flex>
      </Table.Td>
      <Table.Td>
        <Flex justifyContent="center">
          <ButtonGroup>
            <ButtonQuickAction
              icon={isPlaying ? CapUIIcon.CrossO : CapUIIcon.MenuArrow}
              size={CapUIIconSize.Md}
              variantColor="primary"
              aria-pressed={isPlaying}
              label={intl.formatMessage(
                { id: isPlaying ? 'admin.voice-messages.stop' : 'admin.voice-messages.play' },
                { date },
              )}
              onClick={() => onTogglePlay(vocal.id)}
            />
            <ButtonQuickAction
              as="a"
              href={getVoiceMessageFileUrl(vocal.id, true)}
              download
              icon={CapUIIcon.Download}
              size={CapUIIconSize.Md}
              variantColor="primary"
              label={intl.formatMessage({ id: 'admin.voice-messages.download' }, { date })}
            />
          </ButtonGroup>
        </Flex>
      </Table.Td>
    </>
  )
}

export default VoiceMessageItem
