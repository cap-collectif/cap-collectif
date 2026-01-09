import { Box, CapUIFontSize, Flex, Text } from '@cap-collectif/ui'
import MajorityQuestion from '@shared/ui/MajorityQuestion/MajorityQuestion'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'

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
        <MajorityQuestion asPreview />
      </Flex>
    </Box>
  )
}

export default MajorityPreview
