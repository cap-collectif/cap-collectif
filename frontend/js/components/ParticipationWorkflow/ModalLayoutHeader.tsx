import { Box, CapUIFontSize, CapUIIcon, CapUIIconSize, Flex, Icon, Text, Heading } from '@cap-collectif/ui'
import React from 'react'
import ModalClose from '~/components/ParticipationWorkflow/ModalClose'
import { IntlShape } from 'react-intl'
import { NavBarLogo } from '@shared/navbar/NavBar.components'

type HeaderProps = {
  goBackCallback: () => void,
  logo: {
    width: number
    height: number
    url: string
  },
  intl: IntlShape,
  onClose: () => void,
  isMobile: boolean
}

export const DefaultLayout: React.FC<HeaderProps> = ({
  logo,
  goBackCallback,
  isMobile,
  onClose,
  intl
})=> {
  return (
    <Flex alignItems="center" justifyContent="space-between" position="relative" height={['24px', '48px']}>
      <Box position="absolute" left={0} display={['none', 'block']}>
        <Box pl={6}>
          <NavBarLogo logo={logo} />
        </Box>
      </Box>
      <Flex justifyContent="space-between" alignItems="center" margin="auto" maxWidth="540px" width="100%"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Icon
          cursor="pointer"
          onClick={goBackCallback}
          name={CapUIIcon.LongArrowLeft}
          size={CapUIIconSize.Md}
          color="gray.900"
          tabIndex={0}
        />
        <Box textAlign="center">
          <Heading as="h2" fontWeight={400} color={isMobile ? 'gray.700' : 'neutral-gray.900'} mb={0} fontSize={CapUIFontSize.Headline}>
            {
              isMobile ? intl.formatMessage({ id: 'participation-workflow.validation' }) : intl.formatMessage({ id: 'participation-workflow.requirements' })
            }
          </Heading>
          <Text display={['none', 'block']} fontSize={CapUIFontSize.BodyRegular} color="neutral-gray.700" >{intl.formatMessage({ id: 'participation-workflow.validation' })}</Text>
        </Box>
        <ModalClose onClose={onClose} />
      </Flex>
    </Flex>
  )
}

export const CenteredLogoLayout = ({logo}: Pick<HeaderProps, 'logo'>) => {
  return (
    <Flex alignItems="center" justifyContent="center" position="relative">
      <Box pl={6}>
        <NavBarLogo logo={logo} />
      </Box>
    </Flex>
  )
}

export const HideBackArrowLayout: React.FC<HeaderProps> = ({
   logo,
   isMobile,
   onClose,
   intl
 }) => {
  return (
    <Flex alignItems="center" justifyContent="space-between" position="relative" height={['24px', '48px']}>
      <Box position="absolute" left={0} display={['none', 'block']}>
        <Box pl={6}>
          <NavBarLogo logo={logo} />
        </Box>
      </Box>
      <Flex justifyContent="space-between" alignItems="center" margin="auto" maxWidth="540px" width="100%"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
      >
        <Box textAlign="center" width="100%" pl="24px">
          <Heading as="h2" fontWeight={400} color={isMobile ? 'gray.700' : 'neutral-gray.900'} mb={0} fontSize={CapUIFontSize.Headline}>
            {
              isMobile ? intl.formatMessage({ id: 'participation-workflow.validation' }) : intl.formatMessage({ id: 'participation-workflow.requirements' })
            }
          </Heading>
          <Text display={['none', 'block']} fontSize={CapUIFontSize.BodyRegular} color="neutral-gray.700" >{intl.formatMessage({ id: 'participation-workflow.validation' })}</Text>
        </Box>
        <ModalClose onClose={onClose} />
      </Flex>
    </Flex>
  )
}


