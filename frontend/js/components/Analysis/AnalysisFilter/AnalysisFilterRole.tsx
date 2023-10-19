import { $Values } from 'utility-types'
import React, { useEffect } from 'react'
import isEqual from 'lodash/isEqual'
import uniqBy from 'lodash/uniqBy'
import { FormattedMessage, useIntl } from 'react-intl'
import Collapsable from '~ui/Collapsable'
import SearchableDropdownSelect from '~ui/SearchableDropdownSelect'
import UserSearchDropdownChoice from '~/components/Admin/Project/UserSearchDropdownChoice'
import type { Uuid } from '~/types'
import { TYPE_ROLE } from '~/constants/AnalyseConstants'
export type User = {
  readonly id: string
  readonly username: string
}
type Props = {
  type: $Values<typeof TYPE_ROLE>
  title: string
  titleFilter: string
  value: Uuid[] | (Uuid | null | undefined)
  allUserAssigned: User[]
  onChange: (value: Uuid) => void
  reset?: {
    onReset: () => void
    enabled: boolean
    disabled: boolean
    message: string
  }
  isMultiSelect?: boolean
}

const getUsersFiltered = (type: $Values<typeof TYPE_ROLE>, users: User[] = [], userFiltered: Uuid[] | Uuid): User[] => {
  if (type === TYPE_ROLE.ANALYST) {
    return users.filter(user => userFiltered.includes(user.id))
  }

  return [users.find(user => user.id === userFiltered) as any as User]
}

const getUsersCleaned = (
  usersDisplay: User[],
  usersFiltered: User[] = [],
  searchTerm: string | null | undefined,
): User[] => {
  // When searching, display only result
  if (searchTerm) return usersDisplay
  return uniqBy([...usersFiltered, ...usersDisplay], 'id').slice(0, 4)
}

const getUsersFilteredWithSearch = (users: User[] = [], searchUsername: string | null | undefined = ''): User[] => {
  if (searchUsername) {
    return users
      .filter(({ username }) => username.toLowerCase().includes(searchUsername.toLowerCase()))
      .sort((userA, userB) => userA.username.localeCompare(userB.username))
      .slice(0, 4) as any as User[]
  }

  return users.sort((userA, userB) => userA.username.localeCompare(userB.username)).slice(0, 4) as any as User[]
}

const AnalysisFilterRole = ({
  type,
  title,
  titleFilter,
  value,
  allUserAssigned,
  onChange,
  reset,
  isMultiSelect,
}: Props) => {
  const intl = useIntl()
  const [searchTerm, setSearchTerm] = React.useState<string | null | undefined>(null)
  const [usersDisplay, setUsersDisplay] = React.useState([])
  const usersFiltered = value && value.length > 0 ? getUsersFiltered(type, allUserAssigned, value) : []
  useEffect(() => {
    const usersFilteredWithSearch =
      allUserAssigned?.length > 0 ? getUsersFilteredWithSearch(allUserAssigned, searchTerm) : []

    if (!isEqual(usersFilteredWithSearch, usersDisplay)) {
      setUsersDisplay(usersFilteredWithSearch)
    }
  }, [allUserAssigned, searchTerm, usersDisplay])
  return (
    <Collapsable align="right" onClose={() => setSearchTerm(null)}>
      <Collapsable.Button>
        <FormattedMessage id={title} />
      </Collapsable.Button>
      <Collapsable.Element
        ariaLabel={intl.formatMessage({
          id: titleFilter,
        })}
      >
        <SearchableDropdownSelect
          shouldOverflow
          isMultiSelect={isMultiSelect}
          searchPlaceholder={intl.formatMessage({
            id: 'search.user',
          })}
          title={intl.formatMessage({
            id: titleFilter,
          })}
          initialValue={value}
          value={value}
          options={getUsersCleaned(usersDisplay, usersFiltered, searchTerm)}
          noResultsMessage={intl.formatMessage({
            id: 'no_result',
          })}
          onChangeSearch={searchText => setSearchTerm(searchText)}
          onChange={newValue => onChange(newValue)}
          resetChoice={reset}
        >
          {users => users.map(user => <UserSearchDropdownChoice key={user.id} user={user} type={type} />)}
        </SearchableDropdownSelect>
      </Collapsable.Element>
    </Collapsable>
  )
}

export default AnalysisFilterRole
