import React, { FC } from 'react'
import { Box, useTheme } from '@cap-collectif/ui'
import LogoPropulsedBy from '@shared/ui/LogoPropulsedBy/LogoPropulsedBy'

export const FooterBrand: FC = () => {
  const { sizes } = useTheme()

  return (
    <>
      <Box as="a" href="https://cap-collectif.com" display="inline-block">
        <LogoPropulsedBy height={sizes.xl} />
      </Box>
    </>
  )
}
