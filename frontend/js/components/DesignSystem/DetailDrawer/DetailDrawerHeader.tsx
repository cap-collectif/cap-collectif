// @ts-nocheck
import * as React from 'react'
import { Flex, Icon, CapUIIcon, CapUIIconSize, FlexProps } from '@cap-collectif/ui'
type Props = FlexProps & {
  readonly showBackArrow?: boolean
  readonly onClose?: () => void
  children?: JSX.Element | JSX.Element[] | string
}

const DetailDrawerHeader = ({ children, onClose, showBackArrow = true, ...props }: Props) => {
  return (
    <Flex align="center" p={6} {...props}>
      {showBackArrow && (
        <Icon
          onClick={onClose}
          css={{
            '&:hover': {
              cursor: 'pointer',
            },
          }}
          color="blue.500"
          size={CapUIIconSize.Lg}
          className="detail__drawer--back-arow"
          name={CapUIIcon.LongArrowLeft}
        />
      )}
      {children}
    </Flex>
  )
}

DetailDrawerHeader.displayName = 'DetailDrawer.Header'
export default DetailDrawerHeader
