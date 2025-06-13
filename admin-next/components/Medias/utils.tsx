import { Flex, Table, Tag } from '@cap-collectif/ui'
import { MediaList_query$data } from '@relay/MediaList_query.graphql'
import { useIntl } from 'react-intl'

export type Media = MediaList_query$data['medias']['edges'][0]['node']
export type View = 'LIST' | 'GRID'

export const getFileExtension = (filename: string): string => filename.split('.').pop()

export const isImage = (filename: string): boolean =>
  ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'svg', 'gif', 'webp'].includes(getFileExtension(filename))

export const convertFileSize = (size: number | string) => {
  size = Math.abs(parseInt(String(size), 10))
  const formats = [
    [1, 'octets'],
    [1024, 'ko'],
    [1024 * 1024, 'Mo'],
    [1024 * 1024 * 1024, 'Go'],
    [1024 * 1024 * 1024 * 1024, 'To'],
  ]
  if (!size) return '0'
  for (let i = 0; i < formats.length; i++) {
    if (size < Number(formats[i][0])) return `${(size / Number(formats[i - 1][0])).toFixed(0)}${formats[i - 1][1]}`
  }
}

export const TableHead = () => {
  const intl = useIntl()
  return (
    <Table.Thead>
      <Table.Tr>
        <Table.Th>{intl.formatMessage({ id: 'global.media' })}</Table.Th>
        <Table.Th>{intl.formatMessage({ id: 'global.preview' })}</Table.Th>
        <Table.Th>{intl.formatMessage({ id: 'editor.media.size' })}</Table.Th>
        <Table.Th>{intl.formatMessage({ id: 'table-head-label' })}</Table.Th>
        <Table.Th>{intl.formatMessage({ id: 'mediator.add_date' })}</Table.Th>
        <Table.Th />
      </Table.Tr>
    </Table.Thead>
  )
}

export const MediaTags = ({ media }: { media: Media }) => (
  <Flex spacing={2}>
    {media.width && media.height ? <Tag variantColor="infoGray">{`${media.width}x${media.height}px`}</Tag> : null}
    <Tag variantColor="infoGray">{convertFileSize(media.size)}</Tag>
    <Tag variantColor="infoGray">{getFileExtension(media.providerReference)}</Tag>
  </Flex>
)
