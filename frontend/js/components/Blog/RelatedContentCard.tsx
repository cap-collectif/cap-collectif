import * as React from 'react'
import { AbstractCard, Box, CapUIFontSize, CapUIFontWeight, CapUILineHeight, Flex, Heading } from '@cap-collectif/ui'
import DefaultProjectImage from '~/components/Project/Preview/DefaultProjectImage'

type Props = {
  imageUrl?: string
  label?: string
  title: string
  url: string
}

export const RelatedContentCard = ({ imageUrl, label, title, url }: Props) => (
  <Box data-cy="blog-related-content" mt={8} mb={6}>
    {label && (
      <Heading
        fontSize={CapUIFontSize.Headline}
        lineHeight={CapUILineHeight.M}
        fontWeight={CapUIFontWeight.Normal}
        color="neutral-gray.900"
        mb={6}
      >
        {label}
      </Heading>
    )}
    <Box as="a" href={url} display="block" style={{ textDecoration: 'none' }}>
      <AbstractCard
        bg="white"
        p={2}
        width="100%"
        height="94px"
        display="flex"
        flexDirection="row"
        alignItems="center"
        boxShadow="small"
        style={{ borderRadius: '8px', boxShadow: 'none' }}
      >
        {imageUrl ? (
          <Box
            as="img"
            src={imageUrl}
            alt=""
            width="112px"
            height="78px"
            style={{ borderRadius: '8px', objectFit: 'cover' }}
          />
        ) : (
          <Box
            width="112px"
            height="78px"
            bg="neutral-gray.700"
            overflow="hidden"
            position="relative"
            style={{ borderRadius: '8px' }}
          >
            <DefaultProjectImage isNewCard />
          </Box>
        )}
        <Flex ml={4} flex={1} overflow="hidden">
          <Heading
            as="span"
            fontSize="3"
            fontWeight={CapUIFontWeight.Semibold}
            color="neutral-gray.900"
            style={{ overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}
          >
            {title}
          </Heading>
        </Flex>
      </AbstractCard>
    </Box>
  </Box>
)
