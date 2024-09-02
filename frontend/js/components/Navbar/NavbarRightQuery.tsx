import * as React from 'react'
import { Flex } from '@cap-collectif/ui'
import { NavbarRightQuery as NavbarRightQueryType } from '@relay/NavbarRightQuery.graphql'
import { graphql, useLazyLoadQuery } from 'react-relay'
import RegistrationButton from '@shared/register/RegistrationButton'
import LoginButton from '@shared/login/LoginButton'

export const openLoginModal = 'openLoginModal'

export const QUERY = graphql`
  query NavbarRightQuery {
    ...RegistrationButton_query
    ...LoginButton_query
  }
`

export const NavbarRightQuery: React.FC<{ fullWidth?: boolean }> = ({ fullWidth }) => {
  const query = useLazyLoadQuery<NavbarRightQueryType>(QUERY, {})

  return (
    <Flex px={4} width={fullWidth ? '100%' : ''}>
      <RegistrationButton
        query={query}
        justifyContent={fullWidth ? 'center' : ''}
        width={fullWidth ? '100%' : ''}
        borderRadius={fullWidth ? '100px' : 'button'}
        my={fullWidth ? 4 : 2}
        mr={2}
        height={fullWidth ? '48px' : ''}
      />
      <LoginButton
        query={query}
        justifyContent={fullWidth ? 'center' : ''}
        width={fullWidth ? '100%' : ''}
        borderRadius={fullWidth ? '100px' : 'button'}
        my={fullWidth ? 4 : 2}
        height={fullWidth ? '48px' : ''}
      />
    </Flex>
  )
}

export default NavbarRightQuery
