// @ts-nocheck
import * as React from 'react'

import styled from 'styled-components'
import { variant as variantStyle } from 'styled-system'
import type { FlexProps } from '~ui/Primitives/Layout/Flex'
import Flex from '~ui/Primitives/Layout/Flex'
import InfoMessageTitle, { INFO_MESSAGE_TITLE_NAME } from './title'
import InfoMessageContent, { INFO_MESSAGE_CONTENT_NAME } from './content'
export type InfoMessageProps = FlexProps & {
  children: React.ChildrenArray<
    React.ReactElement<typeof InfoMessageTitle> | React.ReactElement<typeof InfoMessageContent>
  >
  variant: 'info' | 'infoGray' | 'danger' | 'success' | 'warning'
}
const InfoMessageInner = styled(Flex)(
  variantStyle({
    variants: {
      info: {
        borderColor: 'blue.200',
        bg: 'blue.100',
        '& .info-message-title, & .info-message-content': {
          color: 'blue.900',
        },
      },
      infoGray: {
        borderColor: 'gray.200',
        bg: 'gray.100',
        '& .info-message-title, & .info-message-content': {
          color: 'gray.900',
        },
      },
      danger: {
        borderColor: 'red.200',
        bg: 'red.100',
        '& .info-message-title, & .info-message-content': {
          color: 'red.900',
        },
      },
      success: {
        borderColor: 'green.200',
        bg: 'green.100',
        '& .info-message-title, & .info-message-content': {
          color: 'green.900',
        },
      },
      warning: {
        borderColor: 'orange.200',
        bg: 'orange.100',
        '& .info-message-title, & .info-message-content': {
          color: 'orange.900',
        },
      },
    },
  }),
)

const InfoMessage = ({ children, variant, ...props }: InfoMessageProps) => {
  const titleChild = React.Children.toArray(children).find(child => {
    if (React.isValidElement(child)) {
      return child.type.displayName === INFO_MESSAGE_TITLE_NAME
    }
  })
  const contentChild = React.Children.toArray(children).find(child => {
    if (React.isValidElement(child)) {
      return child.type.displayName === INFO_MESSAGE_CONTENT_NAME
    }
  })
  return (
    <InfoMessageInner direction="column" p={4} border="normal" borderRadius="normal" variant={variant} {...props}>
      {titleChild &&
        React.cloneElement(titleChild as React.ReactElement<any>, {
          variant,
        })}
      {contentChild}
    </InfoMessageInner>
  )
}

InfoMessage.Title = InfoMessageTitle
InfoMessage.Content = InfoMessageContent
export default InfoMessage
