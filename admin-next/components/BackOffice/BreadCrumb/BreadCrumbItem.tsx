import React from 'react'
import { Text, Link } from '@cap-collectif/ui'

export type BreadCrumbItemType = {
  title: string
  href: string
}

type Props = BreadCrumbItemType & {
  isActive: boolean
}

const BreadCrumbItem: React.FC<Props> = ({ title, href, isActive }) => {
  if (isActive) {
    // Long sub-page titles are truncated so the navbar actions stay visible
    return (
      <Text color="blue.800" title={title} overflow="hidden" whiteSpace="nowrap" sx={{ textOverflow: 'ellipsis' }}>
        {title}
      </Text>
    )
  }

  return (
    <Link href={href} color="gray.700">
      {title}
    </Link>
  )
}

export default BreadCrumbItem
