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
        return (
            <Text color="blue.800">{title}</Text>
        )
    }

    return (
        <Link href={href} color="gray.700">{title}</Link>
    )
}

export default BreadCrumbItem