import React, { FC } from 'react'
import { Box, useTheme } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import LogoPropulsedBy from '@shared/ui/LogoPropulsedBy/LogoPropulsedBy'

export const FooterBrand: FC = () => {
  const { sizes } = useTheme()
  const intl = useIntl()

  return (
    <>
      <Box
        as="a"
        href="https://cap-collectif.com"
        display="inline-block"
        aria-label={`${intl.formatMessage({ id: 'powered_by' })} Cap Collectif`}
      >
        <LogoPropulsedBy height={sizes.xl} />
      </Box>
    </>
  )
}
