import { Table } from '@cap-collectif/ui'
import { useLayoutContext } from '@components/BackOffice/Layout/Layout.context'
import { VideoList_query$key } from '@relay/VideoList_query.graphql'
import EmptyMessage from '@ui/Table/EmptyMessage'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, usePaginationFragment } from 'react-relay'
import { CONNECTION_NODES_PER_PAGE } from './utils'
import VideoItem from './VideoItem'

const FRAGMENT = graphql`
  fragment VideoList_query on Query
  @argumentDefinitions(search: { type: "String" }, first: { type: "Int" }, cursor: { type: "String" })
  @refetchable(queryName: "VideoListPaginationQuery") {
    videos(search: $search, first: $first, after: $cursor) @connection(key: "VideoList_videos", filters: ["search"]) {
      __id
      totalCount
      edges {
        node {
          id
          ...VideoItem_video
        }
      }
    }
  }
`

type Props = {
  queryReference: VideoList_query$key
  resetFilters: () => void
}

const VideoList: React.FC<Props> = ({ queryReference, resetFilters }) => {
  const intl = useIntl()
  const { contentRef } = useLayoutContext()
  const { data, loadNext, hasNext } = usePaginationFragment(FRAGMENT, queryReference)
  const videos = (data?.videos?.edges ?? [])
    .map(edge => edge?.node)
    .filter((video): video is NonNullable<typeof video> => Boolean(video))

  return (
    <Table emptyMessage={<EmptyMessage onReset={resetFilters} />} style={{ border: 'none' }} onReset={resetFilters}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'admin.fields.video.title' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'admin.fields.video.author' })}</Table.Th>
          <Table.Th lineHeight="sm" isNumeric textAlign="left">
            {intl.formatMessage({ id: 'admin.fields.video.position' })}
          </Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'admin.fields.video.is_enabled' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.updated.date' })}</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody
        useInfiniteScroll={videos.length > 0}
        onScrollToBottom={() => loadNext(CONNECTION_NODES_PER_PAGE)}
        hasMore={hasNext}
        scrollParentRef={contentRef || undefined}
      >
        {videos.map(video => (
          <Table.Tr key={video.id} rowId={video.id}>
            <VideoItem video={video} connectionId={data.videos.__id} />
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

export default VideoList
