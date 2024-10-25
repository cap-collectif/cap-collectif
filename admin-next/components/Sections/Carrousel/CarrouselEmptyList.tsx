import { Box, Flex, Heading, Text } from '@cap-collectif/ui'
import { FC } from 'react'
import { useIntl } from 'react-intl'
import { CarrouselEmptyIllustration } from './CarrouselEmptyIllustration'
import { pxToRem } from '@shared/utils/pxToRem'
import { CarrouselAddItemButton } from './CarrouselAddItemButton'
import { UseFieldArrayPrepend } from 'react-hook-form'
import { FormValues } from './Carrousel.utils'

export const CarrouselEmptyList: FC<{ prepend: UseFieldArrayPrepend<FormValues, 'carrouselElements'> }> = ({
  prepend,
}) => {
  const intl = useIntl()
  return (
    <Flex spacing={8}>
      <Box>
        <Heading as="h3" mb={2}>
          {intl.formatMessage({ id: 'section.carousel_param' })}
        </Heading>
        <Text mb={4} lineHeight="base">
          {intl.formatMessage({ id: 'section.carousel_helptext' })}
        </Text>
        <CarrouselAddItemButton prepend={prepend} />
      </Box>
      <CarrouselEmptyIllustration width={pxToRem(300)} flex="none" />
    </Flex>
  )
}

export default CarrouselEmptyList
