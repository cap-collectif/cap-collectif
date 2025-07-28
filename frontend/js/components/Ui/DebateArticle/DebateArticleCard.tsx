import * as React from 'react'

import styled from 'styled-components'
import {
  AbstractCard,
  Icon,
  CapUIIcon,
  CapUIIconSize,
  Text,
  Box,
  Heading,
  Flex,
  CapUIFontSize,
} from '@cap-collectif/ui'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'
import Image from '~ui/Primitives/Image'
export const DebateArticleCardTitle = styled(Heading).attrs(props => ({
  mt: 0,
  mb: 1,
  fontSize: CapUIFontSize.BodyRegular,
  truncate: props.truncate ?? 165,
  lineHeight: 'base',
  color: props.color ?? 'gray.900',
}))``
export const DebateArticleCardDescription = styled(Text).attrs(props => ({
  color: props.color ?? 'gray.900',
  mb: 1,
}))``
export const DebateArticleCardOrigin = styled(Text).attrs(props => ({
  color: props.color ?? 'gray.900',

  /*
  Because in the platform the root font size is set to 16px, 1rem corresponds to 16px but here
  it must be 14px... Because we cannot change the root font size in platform (lot of BCs), it's
  safer to put here the value because it must never change
   */
  fontSize: '14px',
}))``
type Props = AppBoxProps & {
  readonly illustration?: string | null | undefined
  readonly publishedAt?: string | null | undefined
  children: JSX.Element | JSX.Element[] | string
}

const DebateArticleCard = ({ children, illustration, publishedAt, ...props }: Props) => {
  return (
    /** @ts-ignore */
    <AbstractCard bg="white" p={0} flexDirection="column" overflow="hidden" display="flex" {...props}>
      <Box overflow="hidden" height={14}>
        {illustration ? (
          <Image
            preventCdn
            src={illustration}
            width="100%"
            height="100%"
            css={{
              objectFit: 'cover',
            }}
          />
        ) : (
          <Flex justify="center" align="center" width="100%" height="100%" bg="neutral-gray.150">
            <Icon name={CapUIIcon.Newspaper} size={CapUIIconSize.Xxl} color="gray.500" />
          </Flex>
        )}
      </Box>
      <Flex direction="column" px={4} py={2} bg="white" flex={1}>
        {children}
        {publishedAt && (
          <Text color="gray.500" fontSize={CapUIFontSize.BodyRegular} mt="auto" pt={1}>
            {publishedAt}
          </Text>
        )}
      </Flex>
    </AbstractCard>
  )
}

DebateArticleCard.displayName = 'DebateArticleCard'
DebateArticleCardDescription.displayName = 'DebateArticleCard.Description'
DebateArticleCardOrigin.displayName = 'DebateArticleCard.Origin'
DebateArticleCardTitle.displayName = 'DebateArticleCard.Title'
DebateArticleCard.Title = DebateArticleCardTitle
DebateArticleCard.Description = DebateArticleCardDescription
DebateArticleCard.Origin = DebateArticleCardOrigin
export default DebateArticleCard
