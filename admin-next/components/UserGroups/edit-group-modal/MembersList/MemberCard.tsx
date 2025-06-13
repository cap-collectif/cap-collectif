import * as React from 'react'
import { ButtonQuickAction, CapUIBorder, CapUIFontWeight, CapUIIcon, Card, Flex, Tag, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { MembersList_UsersFragment$data } from '@relay/MembersList_UsersFragment.graphql'

type Props = {
  cardKey: string
  isPendingMember?: boolean
  pendingMember?: string
  existingMember?: MembersList_UsersFragment$data['members']['edges'][number]['node']
  setMembersToRemoveIds?: React.Dispatch<React.SetStateAction<string[]>>
  membersToRemoveIds: string[]
  removePendingMember?: (email: string) => void
}

export const MemberCard = ({
  cardKey,
  isPendingMember = false,
  pendingMember,
  existingMember,
  setMembersToRemoveIds,
  membersToRemoveIds,
  removePendingMember,
}: Props): JSX.Element => {
  const intl = useIntl()

  return (
    <Card
      key={cardKey}
      display={'flex'}
      gap={2}
      justifyContent={'flex-start'}
      alignItems={'center'}
      width={'100%'}
      borderRadius={CapUIBorder.Card}
      backgroundColor={'neutral-gray.50'}
      px={4}
      py={2}
      sx={{
        '#delete-btn': {
          visibility: 'hidden',
        },
        '&:hover': {
          backgroundColor: 'danger',
          '#delete-btn': {
            visibility: 'visible',
          },
        },
      }}
    >
      <Flex direction={'column'} flex={1}>
        {isPendingMember ? (
          <Text fontWeight={CapUIFontWeight.Semibold}>{pendingMember}</Text>
        ) : (
          <>
            <Text fontWeight={CapUIFontWeight.Semibold} color={'neutral-gray.600'}>
              {existingMember.username}
            </Text>
            <Text fontWeight={CapUIFontWeight.Semibold}>{existingMember.email}</Text>
          </>
        )}
      </Flex>

      {existingMember?.type === 'INVITATION' && (
        <Tag variantColor="warning">{intl.formatMessage({ id: 'status-invitation-pending' })}</Tag>
      )}

      {(existingMember?.type === 'MEMBER' || isPendingMember) && (
        <ButtonQuickAction
          id="delete-btn"
          icon={CapUIIcon.Trash}
          label={intl.formatMessage({
            id: 'global.delete',
          })}
          variantColor={'danger'}
          onClick={() =>
            isPendingMember
              ? removePendingMember(pendingMember)
              : setMembersToRemoveIds([...membersToRemoveIds, existingMember.userId])
          }
        />
      )}
    </Card>
  )
}

export default MemberCard
