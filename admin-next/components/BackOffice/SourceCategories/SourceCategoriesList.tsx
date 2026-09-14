import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, usePaginationFragment } from 'react-relay'
import { Box, ButtonGroup, CapUIBorder, Flex, Tag, Table } from '@cap-collectif/ui'
import { useLayoutContext } from '@components/BackOffice/Layout/Layout.context'
import { SourceCategoriesList_query$key } from '@relay/SourceCategoriesList_query.graphql'
import { CONNECTION_NODES_PER_PAGE } from './utils'
import SourceCategoryModal from './SourceCategoryModal'
import DeleteSourceCategoryModal from './DeleteSourceCategoryModal'

export const FRAGMENT = graphql`
  fragment SourceCategoriesList_query on Query
  @argumentDefinitions(first: { type: "Int" }, cursor: { type: "String" })
  @refetchable(queryName: "SourceCategoriesListPaginationQuery") {
    sourceCategories(first: $first, after: $cursor) @connection(key: "SourceCategoriesList_sourceCategories") {
      __id
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          isEnabled
          updatedAt
        }
      }
    }
  }
`

type Props = {
  queryReference: SourceCategoriesList_query$key
}

export const SourceCategoriesList: React.FC<Props> = ({ queryReference }) => {
  const intl = useIntl()
  const { contentRef } = useLayoutContext()
  const { data, loadNext, hasNext } = usePaginationFragment(FRAGMENT, queryReference)

  const sourceCategories = data?.sourceCategories?.edges ?? []

  return (
    <Table emptyMessage={<Box />} width="100%" borderRadius={CapUIBorder.Normal}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th noPlaceholder>{intl.formatMessage({ id: 'global.title' })}</Table.Th>
          <Table.Th noPlaceholder>{intl.formatMessage({ id: 'global.maj' })}</Table.Th>
          <Table.Th noPlaceholder>{intl.formatMessage({ id: 'global.published' })}</Table.Th>
          <Table.Th noPlaceholder width="10%" />
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody
        useInfiniteScroll
        onScrollToBottom={() => loadNext(CONNECTION_NODES_PER_PAGE)}
        scrollParentRef={contentRef || undefined}
        hasMore={hasNext}
      >
        {sourceCategories.map(({ node: sourceCategory }) => (
          <Table.Tr key={sourceCategory.id} rowId={sourceCategory.id}>
            <Table.Td>{sourceCategory.title}</Table.Td>
            <Table.Td>
              {intl.formatDate(sourceCategory.updatedAt, { day: 'numeric', month: 'numeric', year: 'numeric' })}
            </Table.Td>
            <Table.Td>
              <Tag variantColor={sourceCategory.isEnabled ? 'success' : 'infoGray'}>
                {intl.formatMessage({ id: sourceCategory.isEnabled ? 'global.published' : 'global.no.published' })}
              </Tag>
            </Table.Td>
            <Table.Td>
              <Flex justify="flex-end">
                <ButtonGroup>
                  <SourceCategoryModal context="edit" sourceCategory={sourceCategory} />
                  <DeleteSourceCategoryModal
                    sourceCategoryId={sourceCategory.id}
                    connectionId={data.sourceCategories.__id}
                  />
                </ButtonGroup>
              </Flex>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

SourceCategoriesList.displayName = 'SourceCategoriesList'

export default SourceCategoriesList
