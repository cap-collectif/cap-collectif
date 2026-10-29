import React from 'react'
import BreadCrumbItem, { BreadCrumbItemType } from './BreadCrumbItem'
import { Flex, Text } from '@cap-collectif/ui'

type Props = {
  breadCrumbItems: Array<BreadCrumbItemType>
}

const BreadCrumbItems: React.FC<Props> = ({ breadCrumbItems }) => {
  if (breadCrumbItems.length === 0) {
    return null
  }

  return (
    <Flex minWidth={0}>
      {breadCrumbItems.map(({ title, href }, index) => {
        const isActive = index === breadCrumbItems.length - 1
        return (
          <Flex key={title} minWidth={isActive ? 0 : undefined} flexShrink={isActive ? 1 : 0}>
            <BreadCrumbItem title={title} href={href} isActive={isActive} />
            {isActive ? null : (
              <Text as="span" mx={2}>
                /
              </Text>
            )}
          </Flex>
        )
      })}
    </Flex>
  )
}

export default BreadCrumbItems
