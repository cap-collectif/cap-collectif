import * as React from 'react'
import { graphql } from 'react-relay'
import type { UserListFieldQuery, UserListFieldQuery$data } from '@relay/UserListFieldQuery.graphql'
import { environment } from 'utils/relay-environement'
import { FieldInput, FieldSelect, BaseField } from '@cap-collectif/form'
import { fetchQuery, GraphQLTaggedNode } from 'relay-runtime'

interface UserListFieldProps extends Omit<BaseField, 'onChange'>, Omit<FieldSelect, 'type' | 'onChange'> {
  userIdsToNoSearch?: string[]
  authorOfEvent?: boolean
  id?: string
  isMediatorCompliant?: boolean
}

type UserListFieldValue = {
  label: string
  value: string
}

const getUserList = graphql`
  query UserListFieldQuery(
    $notInIds: [String]
    $displayName: String
    $authorOfEventOnly: Boolean
    $isMediatorCompliant: Boolean
  ) {
    userSearch(
      notInIds: $notInIds
      displayName: $displayName
      authorsOfEventOnly: $authorOfEventOnly
      isMediatorCompliant: $isMediatorCompliant
    ) {
      id
      displayName
      email
    }
  }
` as GraphQLTaggedNode

const formatUsersData = (users: UserListFieldQuery$data['userSearch']) => {
  const duplicateNames: { [key: string]: [number] } = {}

  if (!users) return []

  users.forEach((user, index) => {
    if (user) {
      const { displayName } = user
      if (duplicateNames[displayName]) {
        duplicateNames[displayName].push(index)
      } else {
        duplicateNames[displayName] = [index]
      }
    }
  })

  return users.map(user => {
    if (user) {
      const { id, displayName, email } = user
      let label = displayName
      if (duplicateNames[displayName] && duplicateNames[displayName].length > 1) {
        label = `${displayName} - ${email}`
      }
      return {
        value: id,
        label,
      }
    }
  })
}

export const UserListField: React.FC<UserListFieldProps> = ({
  userIdsToNoSearch = [],
  authorOfEvent = false,
  isMediatorCompliant = false,
  name,
  control,
  ...props
}) => {
  const loadOptions = async (search: string): Promise<UserListFieldValue[]> => {
    const usersData = await fetchQuery<UserListFieldQuery>(environment, getUserList, {
      notInIds: userIdsToNoSearch,
      displayName: search,
      authorOfEventOnly: authorOfEvent,
      isMediatorCompliant: isMediatorCompliant,
    }).toPromise()

    if (usersData && usersData.userSearch) {
      return formatUsersData(usersData.userSearch) as UserListFieldValue[]
    }

    return []
  }

  return <FieldInput {...props} type="select" control={control} name={name} defaultOptions loadOptions={loadOptions} />
}

export default UserListField
