import { Button, CapUIIcon, CapUIIconSize, Flex, Search, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import VideoList from '@components/BackOffice/Videos/VideoList'
import { CONNECTION_NODES_PER_PAGE } from '@components/BackOffice/Videos/utils'
import { videos_Query } from '@relay/videos_Query.graphql'
import debounce from '@shared/utils/debounce-promise'
import TablePlaceholder from '@ui/Table/TablePlaceholder'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay'

const QUERY: GraphQLTaggedNode = graphql`
  query videos_Query($search: String, $first: Int) {
    ...VideoList_query @arguments(search: $search, first: $first)
  }
`

const VideosTab: React.FC = () => {
  const intl = useIntl()
  const [term, setTerm] = React.useState<string>('')

  const onTermChange = debounce((value: string) => setTerm(value), 400)

  const queryReference = useLazyLoadQuery<videos_Query>(QUERY, {
    search: term || null,
    first: CONNECTION_NODES_PER_PAGE,
  })

  return (
    <Flex direction="column" width="100%" spacing={6} bg="white" borderRadius="accordion" p={8} justify="flex-start">
      <Flex alignItems="center" spacing={6}>
        <Button
          variant="primary"
          variantColor="primary"
          variantSize="small"
          leftIcon={CapUIIcon.Add}
          onClick={() => window.open('/admin-next/video', '_self')}
        >
          {intl.formatMessage({ id: 'admin.videos.create' })}
        </Button>
        <Search onChange={onTermChange} value={term} placeholder={intl.formatMessage({ id: 'admin.videos.search' })} />
      </Flex>

      <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={5} />}>
        <VideoList queryReference={queryReference} resetFilters={() => setTerm('')} />
      </React.Suspense>
    </Flex>
  )
}

export const getServerSideProps = withFeatureFlagRequired(
  'unstable__sonata_migration_to_admin_next',
  '/admin/capco/app/video/list',
)

const VideosPage: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.video' })}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <VideosTab />
      </React.Suspense>
    </Layout>
  )
}

export default VideosPage
