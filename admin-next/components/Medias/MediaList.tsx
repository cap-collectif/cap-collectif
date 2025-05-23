import * as React from 'react'
import {
  Box,
  Table,
  ButtonGroup,
  ButtonQuickAction,
  CapUIIcon,
  Icon,
  CapUIIconSize,
  Flex,
  Grid,
  Spinner,
  Button,
  SkeletonText,
  Text,
} from '@cap-collectif/ui'
import InfiniteScroll from 'react-infinite-scroller'
import { graphql, usePaginationFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import { MediaList_query$key } from '@relay/MediaList_query.graphql'
import moment from 'moment'
import copy from 'copy-to-clipboard'
import MediaModal from './MediaModal'
import { convertFileSize, isImage, Media, MediaTags, TableHead, View } from './utils'
import { useLayoutContext } from '@components/Layout/Layout.context'
import EmptyMessage from '@ui/Table/EmptyMessage'
import MediaDeleteModal from './MediaDeleteModal'

export interface MediaListProps {
  query: MediaList_query$key
  term: string
  onReset: () => void
  view: View
  isUploadingLength?: number
}

export const FRAGMENT = graphql`
  fragment MediaList_query on Query
  @argumentDefinitions(term: { type: "String" }, count: { type: "Int" }, cursor: { type: "String" })
  @refetchable(queryName: "MediaListQuery") {
    medias(after: $cursor, first: $count, term: $term, showProfilePictures: false)
      @connection(key: "MediaList_medias", filters: ["term"]) {
      __id
      totalCount
      edges {
        node {
          id
          name
          providerReference
          width
          height
          size
          createdAt
          url
        }
      }
    }
  }
`

const MediaList: React.FC<MediaListProps> = ({ query: queryRef, onReset, view, term, isUploadingLength }) => {
  const [isCopied, setIsCopied] = React.useState<boolean>(false)
  const [selectedMediaToShow, setSelectedMediaToShow] = React.useState<Media | null>(null)
  const [selectedMediasToDelete, setSelectedMediasToDelete] = React.useState<string[]>([])
  const firstRendered = React.useRef<true | null>(null)

  const { contentRef } = useLayoutContext()

  const intl = useIntl()
  const { data: query, loadNext, hasNext, refetch } = usePaginationFragment(FRAGMENT, queryRef)

  const totalCount = query.medias?.totalCount

  const medias = query.medias?.edges
    ?.filter(Boolean)
    .map(edge => edge?.node)
    .filter(Boolean)

  const hasMedias = (totalCount ?? 0) > 0

  React.useEffect(() => {
    if (firstRendered.current) {
      refetch({
        term: term || null,
      })
    }
    firstRendered.current = true
  }, [term, refetch])

  return (
    <>
      {selectedMediaToShow ? (
        <MediaModal
          media={selectedMediaToShow}
          onClose={() => setSelectedMediaToShow(null)}
          onDelete={setSelectedMediasToDelete}
        />
      ) : null}
      {selectedMediasToDelete?.length ? (
        <MediaDeleteModal
          medias={selectedMediasToDelete}
          onClose={() => {
            setSelectedMediasToDelete([])
          }}
          connectionName={query?.medias?.__id}
        />
      ) : null}
      {view === 'LIST' ? (
        <Table
          selectable
          emptyMessage={hasMedias ? null : <EmptyMessage onReset={onReset} />}
          actionBar={({ selectedRows }) => (
            <>
              <Flex alignItems="center" spacing={4}>
                <Box as="span">
                  {intl.formatMessage(
                    {
                      id: 'admin-opinions-list-selected',
                    },
                    { itemCount: selectedRows.length },
                  )}
                </Box>
              </Flex>
              <Button variant="secondary" variantColor="danger" onClick={() => setSelectedMediasToDelete(selectedRows)}>
                {intl.formatMessage({ id: 'global.delete' })}
              </Button>
            </>
          )}
        >
          <TableHead />
          <Table.Tbody
            useInfiniteScroll
            onScrollToBottom={() => loadNext(50)}
            hasMore={hasNext}
            scrollParentRef={contentRef || undefined}
          >
            {isUploadingLength
              ? Array.from({ length: isUploadingLength }, (_, index) => (
                  <Table.Tr key={index}>
                    <Table.Td colSpan={6}>
                      <SkeletonText size="lg" />
                    </Table.Td>
                  </Table.Tr>
                ))
              : null}
            {hasMedias &&
              medias?.map(media => {
                return (
                  <Table.Tr key={media.id} rowId={media.id}>
                    <Table.Td>{media.name}</Table.Td>
                    <Table.Td>
                      {isImage(media.providerReference) ? (
                        <Box position="relative">
                          <Box
                            as="img"
                            loading="lazy"
                            src={media.url}
                            width={8}
                            height={8}
                            borderRadius="normal"
                            sx={{ objectFit: 'cover' }}
                          />
                          <Flex
                            onClick={() => setSelectedMediaToShow(media)}
                            alignItems="center"
                            justifyContent="center"
                            as="button"
                            bg="primary.lighter"
                            width={8}
                            height={8}
                            borderRadius="normal"
                            position="absolute"
                            top="0"
                            left="0"
                            opacity={0}
                            _hover={{ opacity: 1 }}
                          >
                            <Icon name={CapUIIcon.Eye} size={CapUIIconSize.Md} color="primary.base" />
                          </Flex>
                        </Box>
                      ) : (
                        <Flex alignItems="center" justifyContent="center" width={8} height={8}>
                          <Icon name={CapUIIcon.File} size={CapUIIconSize.Md} color="gray.500" />
                        </Flex>
                      )}
                    </Table.Td>
                    <Table.Td>{media.width && media.height ? `${media.width} x ${media.height} px` : '-'}</Table.Td>
                    <Table.Td>{convertFileSize(media.size)}</Table.Td>
                    <Table.Td>{moment(media.createdAt).format('DD/MM/YYYY')}</Table.Td>
                    <Table.Td onMouseLeave={() => setIsCopied(false)}>
                      <ButtonGroup>
                        <ButtonQuickAction
                          onClick={() => {
                            copy(media.url)
                            setIsCopied(true)
                          }}
                          variantColor="primary"
                          icon={CapUIIcon.Link}
                          label={intl.formatMessage({ id: isCopied ? 'copied-link' : 'copy-link' })}
                        />
                        <ButtonQuickAction
                          onClick={() => {
                            setSelectedMediasToDelete([media.id])
                          }}
                          variantColor="danger"
                          icon={CapUIIcon.Trash}
                          label={intl.formatMessage({ id: 'global.delete' })}
                        />
                      </ButtonGroup>
                    </Table.Td>
                  </Table.Tr>
                )
              })}
          </Table.Tbody>
        </Table>
      ) : (
        <InfiniteScroll
          key="infinite-scroll-medias"
          initialLoad={false}
          loadMore={() => loadNext(50)}
          hasMore={hasNext}
          loader={
            <Flex direction="row" justify="center" key={0}>
              <Spinner size={CapUIIconSize.Md} />
            </Flex>
          }
          getScrollParent={contentRef?.current ? () => contentRef?.current : undefined}
          useWindow={!Boolean(contentRef?.current)}
        >
          <Grid
            gap={4}
            flexWrap="wrap"
            width="100%"
            gridTemplateColumns={[
              'repeat(1, minmax(0, 1fr))',
              'repeat(2, minmax(0, 1fr))',
              'repeat(3, minmax(0, 1fr))',
              'repeat(4, minmax(0, 1fr))',
              'repeat(5, minmax(0, 1fr))',
            ]}
          >
            {isUploadingLength
              ? Array.from({ length: isUploadingLength }, (_, index) => (
                  <Box position="relative" width="100%" key={index} borderRadius="normal" overflow="hidden">
                    <SkeletonText height="175px" />
                  </Box>
                ))
              : null}
            {hasMedias &&
              medias?.map(media => (
                <Box
                  position="relative"
                  width="100%"
                  height="175px"
                  key={media.id}
                  borderRadius="normal"
                  overflow="hidden"
                  backgroundColor="gray.100"
                >
                  {isImage(media.providerReference) ? (
                    <Box as="img" width="100%" height="100%" src={media.url} sx={{ objectFit: 'contain' }} />
                  ) : (
                    <Flex justify="center" alignItems="center" bg="gray.100" height="100%" direction="column">
                      <Icon name={CapUIIcon.FileO} size={CapUIIconSize.Xl} color="gray.700" />
                      <Text truncate={50} color="gray.900" textAlign="center" px={5}>
                        {media.name}
                      </Text>
                    </Flex>
                  )}
                  <Flex
                    position="absolute"
                    flexDirection="column"
                    top="0"
                    left="0"
                    width="100%"
                    height="100%"
                    backgroundColor="rgba(255, 255, 255, 0.9)"
                    opacity={0}
                    _hover={{ opacity: 1 }}
                  >
                    <Flex flex="1" justify="center" alignItems="center">
                      <ButtonGroup onMouseLeave={() => setIsCopied(false)}>
                        {isImage(media.providerReference) ? (
                          <ButtonQuickAction
                            onClick={() => setSelectedMediaToShow(media)}
                            variantColor="primary"
                            icon={CapUIIcon.Eye}
                            label={intl.formatMessage({ id: 'global.more' })}
                          />
                        ) : null}
                        <ButtonQuickAction
                          onClick={() => {
                            copy(media.url)
                            setIsCopied(true)
                          }}
                          variantColor="primary"
                          icon={CapUIIcon.Link}
                          label={intl.formatMessage({ id: isCopied ? 'copied-link' : 'copy-link' })}
                        />
                        <ButtonQuickAction
                          onClick={() => setSelectedMediasToDelete([media.id])}
                          variantColor="danger"
                          icon={CapUIIcon.Trash}
                          label={intl.formatMessage({ id: 'global.delete' })}
                        />
                      </ButtonGroup>
                    </Flex>
                    <Flex p={2} bg="white" justifyContent="center">
                      <MediaTags media={media} />
                    </Flex>
                  </Flex>
                </Box>
              ))}
          </Grid>
        </InfiniteScroll>
      )}
    </>
  )
}

export default MediaList
