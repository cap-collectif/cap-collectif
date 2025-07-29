import * as React from 'react'
import { useIntl } from 'react-intl'
import { Box, CapUIFontSize, Flex, Text } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'

export const COLORS = [
  { label: 'very-well', color: '#33691e' },
  { label: 'global-well', color: '#43a047' },
  { label: 'global-well-enough', color: '#ffc107' },
  { label: 'global-passable', color: '#ff9800' },
  { label: 'global-not-passable', color: '#b71c1c' },
  { label: 'global-reject', color: '#212121' },
]

const MajorityPreview: React.FC = () => {
  const intl = useIntl()

  const { watch } = useFormContext()
  const title = watch(`temporaryQuestion.title`)

  return (
    <Box>
      <Text fontWeight="600" mb={2} fontSize={CapUIFontSize.BodyRegular} color="gray.500" uppercase>
        {intl.formatMessage({ id: 'global.preview' })}
      </Text>
      <Flex direction="column" bg="#f1f2f3" border="normal" borderColor="gray.200" borderRadius="normal" p={4}>
        <Text fontWeight="600" mb={2} fontSize={CapUIFontSize.Headline}>
          {title || ''}
        </Text>
        <Flex borderRadius="normal" overflow="hidden" width="100%">
          {COLORS.map((majority, idx) => (
            <Flex
              py={1}
              bg={majority.color}
              color="white"
              fontWeight={600}
              key={idx}
              fontSize={[CapUIFontSize.Caption, CapUIFontSize.Caption, CapUIFontSize.BodySmall]}
              justifyContent="center"
              alignItems="center"
              textAlign="center"
              flex="1"
            >
              {intl.formatMessage({ id: majority.label })}
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Box>
  )
}

export default MajorityPreview
