import { Box, Flex, Text } from '@cap-collectif/ui'
import * as React from 'react'
import { useIntl } from 'react-intl'

type Props = {
  onOpen: () => void
  onAccept: () => void
  onRefuse: () => void
}

export const CookieBanner: React.FC<Props> = ({ onOpen, onAccept, onRefuse }: Props) => {
  const intl = useIntl()

  return (
    <Flex
      id="cookie-banner"
      className="cookie-banner"
      direction={['column', 'column', 'row']}
      p={8}
      gap={[4, 4, 6]}
      alignItems="center"
      color="white"
      bg="neutral-gray.900"
      position="fixed"
      bottom={0}
      width="100%"
      zIndex={1040}
      justifyContent="space-between"
    >
      <Flex direction="column" spacing={2} className="cookie-text-wrapper" alignItems="flex-start">
        <Text lineHeight="2rem">
          {intl.formatMessage({
            id: 'cookies-text',
          })}
        </Text>
        <Box as="button" type="button" id="cookies-parameters" onClick={onOpen} sx={{ textDecoration: 'underline' }}>
          {intl.formatMessage({
            id: 'setup-cookies',
          })}
        </Box>
      </Flex>
      <Flex className="cookie-button" gap={4} flex="none">
        <Box fontWeight={600} as="button" type="button" id="cookie-decline-button" onClick={onRefuse}>
          {intl.formatMessage({
            id: 'decline-optional-cookies',
          })}
        </Box>
        <Box
          fontWeight={600}
          as="button"
          type="button"
          id="cookie-consent"
          className="btn-cookie-consent"
          bg="white"
          borderRadius="button"
          px={4}
          py={3}
          color="neutral-gray.900"
          onClick={onAccept}
        >
          {intl.formatMessage({
            id: 'accept-everything',
          })}
        </Box>
      </Flex>
    </Flex>
  )
}

export default CookieBanner
