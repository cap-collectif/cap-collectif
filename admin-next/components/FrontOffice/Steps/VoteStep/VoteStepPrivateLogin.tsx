import { CapUIFontSize, CapUISpotIcon, CapUISpotIconSize, Flex, SpotIcon, Text } from '@cap-collectif/ui'
import { LoginButtonQueryWrapper } from '@shared/login/LoginButton'
import { pxToRem } from '@shared/utils/pxToRem'
import * as React from 'react'
import { useIntl } from 'react-intl'

// Displayed instead of the proposals list when the collect step is private and the viewer is anonymous
const VoteStepPrivateLogin: React.FC = () => {
  const intl = useIntl()

  return (
    <Flex
      id="private-collect-login"
      direction="column"
      alignItems="center"
      justifyContent="center"
      gap="lg"
      bg="white"
      borderRadius="accordion"
      px="md"
      py={pxToRem(88)}
      mx={[4, 0]}
      textAlign="center"
    >
      <SpotIcon name={CapUISpotIcon.CODES} size={CapUISpotIconSize.Lg} />
      <Text as="p" role="status" color="text.primary" fontSize={CapUIFontSize.Headline} maxWidth={pxToRem(480)}>
        {intl.formatMessage({ id: 'proposal.private.show_login' })}
      </Text>
      <React.Suspense fallback={null}>
        <LoginButtonQueryWrapper id="private-collect-login-button" my={0} />
      </React.Suspense>
    </Flex>
  )
}

export default VoteStepPrivateLogin
