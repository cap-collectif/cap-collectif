import * as React from 'react'
import { CapUIIcon, CapUIIconSize, Flex, Icon, Text } from '@cap-collectif/ui'
import UserTypeModal from './UserTypeModal'
import Image from '@shared/ui/Image'
import { pxToRem } from '@shared/utils/pxToRem'
import { UserTypesList_query$data } from '@relay/UserTypesList_query.graphql'

type Props = {
  type: UserTypesList_query$data['userTypes']['edges'][number]['node']
  connectionId: string
}

export const UserTypeCard: React.FC<Props> = ({ type, connectionId }) => {
  return (
    <Flex
      direction="column"
      border="normal"
      borderColor="gray.200"
      borderRadius="normal"
      overflow="hidden"
      width={pxToRem(264)}
      className="user-type-card"
    >
      <Flex direction="row" bg="gray.100" height={pxToRem(96)} align="center" justify="center" overflow="hidden">
        {type?.media?.url ? (
          <Image src={type?.media?.url} alt="" />
        ) : (
          <Icon name={CapUIIcon.User} color="gray.500" size={CapUIIconSize.Lg} />
        )}
      </Flex>
      <Flex direction="row" flexGrow={1} p={6} justify="space-between" align="center">
        <Text>{type.name}</Text>
        <UserTypeModal context="edit" userTypeData={type} connectionId={connectionId} />
      </Flex>
    </Flex>
  )
}

export default UserTypeCard
