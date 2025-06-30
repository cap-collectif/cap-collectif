'use client'

import { Box, BoxProps, CapUIFontSize, Heading, Text } from '@cap-collectif/ui'
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
          <Box backgroundColor={siteColors.pageBackgroundHeaderColor} py={[8, 'xxl']}>
            <Box maxWidth={pxToRem(1280)} px={[4, 6]} mx="auto">
              {title ? (
                <Heading
                  as="h1"
                  fontWeight={600}
                  color={siteColors.pageTitleColor}
                  fontSize={[CapUIFontSize.DisplaySmall, CapUIFontSize.DisplayMedium]}
                >
                  {title}
                </Heading>
              ) : null}
              {subtitle ? (
                <Text as="div" fontSize={CapUIFontSize.BodyLarge} color={siteColors.pageSubTitleColor}>
                  {subtitle}
                </Text>
              ) : null}
            </Box>
          </Box>
        ) : null}
        {body ? (
          <Box textAlign="center" py={[4, 4, 8]} backgroundColor={siteColors.sectionBackground}>
            <Box mx="auto" maxWidth={pxToRem(1280)} px={[4, 6]}>
              <Text fontSize={CapUIFontSize.BodyLarge} color={siteColors.sectionTextColor} as="div">
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
