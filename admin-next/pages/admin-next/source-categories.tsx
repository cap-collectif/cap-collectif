import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import SourceCategoriesList from '@components/BackOffice/SourceCategories/SourceCategoriesList'
import SourceCategoryModal from '@components/BackOffice/SourceCategories/SourceCategoryModal'
import { CONNECTION_NODES_PER_PAGE } from '@components/BackOffice/SourceCategories/utils'
import TablePlaceholder from '@components/BackOffice/UI/Table/TablePlaceholder'
import { sourceCategories_Query } from '@relay/sourceCategories_Query.graphql'

const QUERY: GraphQLTaggedNode = graphql`
  query sourceCategories_Query($first: Int) {
    ...SourceCategoriesList_query @arguments(first: $first)
  }
`

const SourceCategoriesTab: React.FC = () => {
  const queryReference = useLazyLoadQuery<sourceCategories_Query>(QUERY, { first: CONNECTION_NODES_PER_PAGE })

  return (
    <Flex direction="column" width="100%" spacing={6} bg="white" borderRadius="accordion" p={8} justify="flex-start">
      <Flex alignItems="center">
        <SourceCategoryModal context="create" />
      </Flex>

      <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={4} />}>
        <SourceCategoriesList queryReference={queryReference} />
      </React.Suspense>
    </Flex>
  )
}

export const getServerSideProps = withPageAuthRequired

const SourceCategoriesPage: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.category' })}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <SourceCategoriesTab />
      </React.Suspense>
    </Layout>
  )
}

export default SourceCategoriesPage
