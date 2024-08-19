import * as React from 'react'
import { Flex } from '@cap-collectif/ui'
import styled from 'styled-components'
import { openLoginModal } from '../User/Login/LoginButton'
import { onElementAvailable } from '@shared/navbar/NavBar.utils'

const BackGroundImage = styled.img`
  width: 1280px;
  height: 830px;
  max-width: 100%;
  max-height: 100%;
`

const AccessDeniedAuth = (): JSX.Element => {
  React.useEffect(() => {
    onElementAvailable('button#login-button', () => {
      setTimeout(() => dispatchEvent(new Event(openLoginModal)), 200)
    })
  }, [])
  return (
    <Flex justifyContent="center" bg="white">
      <BackGroundImage loading="lazy" src="/image/403_auth_login.jpeg" alt="" />
    </Flex>
  )
}

export default AccessDeniedAuth
