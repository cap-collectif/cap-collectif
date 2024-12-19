'use client'

import { Box, BoxProps, Heading, Text } from '@cap-collectif/ui'
import { useAppContext } from '@components/AppProvider/App.context'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { pxToRem } from '@shared/utils/pxToRem'
import { FC } from 'react'

export const PageHeading: FC<BoxProps & { title?: string; subtitle?: string; body?: string }> = ({
  title,
  subtitle,
  body,
  ...rest
}) => {
  const { siteColors } = useAppContext()

  return (
    <Box {...rest}>
      <div>
        {title || subtitle ? (
          <Box textAlign="center" backgroundColor={siteColors.pageBackgroundHeaderColor} py={[4, 4, 8]}>
            <Box mx="auto" maxWidth={pxToRem(1280)} px={[4, 6]}>
              {title ? (
                <Heading as="h1" mb={2} fontWeight={500} color={siteColors.pageTitleColor}>
                  {title}
                </Heading>
              ) : null}
              {subtitle ? (
                <Text as="div" fontSize="1.15rem" color={siteColors.pageSubTitleColor}>
                  {subtitle}
                </Text>
              ) : null}
            </Box>
          </Box>
        ) : null}
        {body ? (
          <Box textAlign="center" py={[4, 4, 8]} backgroundColor={siteColors.sectionBackground}>
            <Box mx="auto" maxWidth={pxToRem(1280)} px={[4, 6]}>
              <Text fontSize="1.15rem" color={siteColors.sectionTextColor} as="div">
                <WYSIWYGRender value={body} />
              </Text>
            </Box>
          </Box>
        ) : null}
      </div>
    </Box>
  )
}

export default PageHeading
