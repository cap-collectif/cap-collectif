'use client'

import { Box, BoxProps, CapUIFontSize, Heading, Text } from '@cap-collectif/ui'
import { useAppContext } from '@components/AppProvider/App.context'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { pxToRem } from '@shared/utils/pxToRem'
import { FC } from 'react'

type PageHeadingProps = { title?: string; subtitle?: string; body?: string; mode?: 'default' | 'large' }

export const PageHeading: FC<BoxProps & PageHeadingProps> = ({ title, subtitle, body, mode = 'default', ...rest }) => {
  const { siteColors } = useAppContext()

  return (
    <Box {...rest}>
      <Box display={mode === 'default' ? 'block' : 'flex'} flex="1 1 0">
        {title || subtitle ? (
          <Box
            backgroundColor={siteColors.pageBackgroundHeaderColor}
            py={[8, 'xxl']}
            width={mode === 'large' ? '100%' : null}
          >
            <Box maxWidth={pxToRem(1280)} px={[4, mode === 'large' ? 'xxl' : 'lg']} mx="auto">
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
                <Text
                  as={mode === 'default' ? 'div' : 'p'}
                  fontSize={CapUIFontSize.BodyLarge}
                  color={siteColors.pageSubTitleColor}
                >
                  <WYSIWYGRender value={subtitle} />
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
      </Box>
    </Box>
  )
}

export default PageHeading
