import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import type { VideoItem_video$key } from '@relay/VideoItem_video.graphql'
import { Flex, Link, Table, Tag, Text, Tooltip } from '@cap-collectif/ui'
import DeleteVideoConfirmationModal from './DeleteVideoConfirmationModal'

type Props = {
  video: VideoItem_video$key
  connectionId: string
}

const FRAGMENT = graphql`
  fragment VideoItem_video on Video {
    id
    title
    isEnabled
    position
    updatedAt
    author {
      displayName
    }
  }
`

const VideoItem: React.FC<Props> = ({ video: videoFragment, connectionId }) => {
  const video = useFragment(FRAGMENT, videoFragment)
  const intl = useIntl()
  const url = `/admin-next/video?id=${video.id}`

  return (
    <>
      <Table.Td>
        {video.title.length > 128 ? (
          <Tooltip label={video.title}>
            <Link truncate={128} href={url}>
              {video.title}
            </Link>
          </Tooltip>
        ) : (
          <Link truncate={128} href={url}>
            {video.title}
          </Link>
        )}
      </Table.Td>
      <Table.Td>{video.author?.displayName ? <Text>{video.author.displayName}</Text> : null}</Table.Td>
      <Table.Td isNumeric textAlign="left">
        {video.position}
      </Table.Td>
      <Table.Td>
        {video.isEnabled ? (
          <Tag variantColor="success">{intl.formatMessage({ id: 'global.yes' })}</Tag>
        ) : (
          <Tag variantColor="infoGray">{intl.formatMessage({ id: 'global.no' })}</Tag>
        )}
      </Table.Td>
      <Table.Td>
        {video.updatedAt
          ? intl.formatDate(video.updatedAt, {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
            })
          : null}
      </Table.Td>
      <Table.Td>
        <Flex direction="row" justify="space-evenly" gap={2}>
          <DeleteVideoConfirmationModal title={video.title} videoId={video.id} connectionId={connectionId} />
        </Flex>
      </Table.Td>
    </>
  )
}

export default VideoItem
