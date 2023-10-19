import * as React from 'react'
import { Skeleton } from '@cap-collectif/ui'

export const MetadataPlaceHolder = ({
  ready,
  children,
}: {
  ready: boolean
  children: JSX.Element | JSX.Element[] | string
}): JSX.Element => (
  <Skeleton isLoaded={ready} placeholder={<Skeleton.Text size="sm" width="150px" />}>
    {children}
  </Skeleton>
)
