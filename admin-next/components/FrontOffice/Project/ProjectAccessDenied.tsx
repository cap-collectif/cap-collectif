'use client'

import * as React from 'react'
import { useIntl } from 'react-intl'
import {
  Box,
  Button,
  CapUIFontSize,
  CapUIFontWeight,
  CapUISpotIcon,
  CapUISpotIconSize,
  Flex,
  Link,
  SpotIcon,
  Text,
  VisuallyHidden,
} from '@cap-collectif/ui'
import { openLoginModal } from '@shared/login/LoginButton'
import { onElementAvailable } from '@shared/navbar/NavBar.utils'
import { pxToRem } from '@shared/utils/pxToRem'

// Delay before opening the login modal, kept from the legacy page: the navbar login button
// registers its modal listener right after being mounted.
const LOGIN_MODAL_OPENING_DELAY = 200

// Reproduces the legacy Symfony `Project/403_auth.html.twig` page shown to anonymous viewers.
const ProjectAccessDeniedAnonymous: React.FC = () => {
  const intl = useIntl()

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined
    onElementAvailable('button#login-button', () => {
      timeout = setTimeout(() => dispatchEvent(new Event(openLoginModal)), LOGIN_MODAL_OPENING_DELAY)
    })

    return () => clearTimeout(timeout)
  }, [])

  return (
    <Flex id="project-access-denied-auth" justifyContent="center" bg="white">
      {/* The legacy page only shows a decorative image: give screen reader users the page purpose. */}
      <VisuallyHidden>
        <h1>{intl.formatMessage({ id: 'unauthorized-access' })}</h1>
      </VisuallyHidden>
      <Box
        as="img"
        loading="lazy"
        src="/image/403_auth_login.jpeg"
        alt=""
        width={pxToRem(1280)}
        height={pxToRem(830)}
        maxWidth="100%"
        maxHeight="100%"
      />
    </Flex>
  )
}

// Reproduces the legacy Symfony `Default/403.html.twig` page shown to authenticated viewers.
const ProjectAccessDeniedAuthenticated: React.FC = () => {
  const intl = useIntl()

  return (
    <Flex
      id="project-access-denied"
      direction="column"
      justifyContent="flex-start"
      alignItems="center"
      bg="white"
      py={pxToRem(100)}
    >
      <Text as="h1" fontSize={CapUIFontSize.DisplaySmall} fontWeight={CapUIFontWeight.Semibold} mb="xs">
        {intl.formatMessage({ id: 'unauthorized-access' })}
      </Text>
      <Text fontSize={CapUIFontSize.Headline} mb={pxToRem(41)} textAlign="center">
        {intl.formatMessage({ id: 'restricted-access' })}
      </Text>
      <SpotIcon name={CapUISpotIcon.PROHIBITED} size={CapUISpotIconSize.Lg} mb={pxToRem(41)} />
      <Button as="a" href="/" variant="primary" variantColor="primary" variantSize="big" mb="md">
        {intl.formatMessage({ id: 'back-to-homepage' })}
      </Button>
      <Link href="/contact" fontSize={CapUIFontSize.BodyRegular}>
        {intl.formatMessage({ id: 'error.report' })}
      </Link>
    </Flex>
  )
}

export const ProjectAccessDenied: React.FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) =>
  isAuthenticated ? <ProjectAccessDeniedAuthenticated /> : <ProjectAccessDeniedAnonymous />

export default ProjectAccessDenied
