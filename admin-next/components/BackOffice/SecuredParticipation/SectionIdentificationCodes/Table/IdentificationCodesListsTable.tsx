import type { FC } from 'react'
import { Table } from '@cap-collectif/ui'
import IdentificationCodesListsTableLine from './IdentificationCodesListsTableLine'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import type { IdentificationCodesListsTable_viewer$key } from '@relay/IdentificationCodesListsTable_viewer.graphql'

const FRAGMENT = graphql`
  fragment IdentificationCodesListsTable_viewer on User {
    userIdentificationCodeLists(first: 100)
      @connection(key: "IdentificationCodesListsTable_userIdentificationCodeLists", filters: []) {
      __id
      edges {
        node {
          id
          ...IdentificationCodesListsTableLine_userIdentificationCodeList
        }
      }
    }
  }
`

type IdentificationCodesListsTableProps = {
  viewer: IdentificationCodesListsTable_viewer$key
}

const IdentificationCodesListsTable: FC<IdentificationCodesListsTableProps> = ({ viewer: viewerFragment }) => {
  const intl = useIntl()
  const viewer = useFragment(FRAGMENT, viewerFragment)

  return (
    <Table emptyMessage={''}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{intl.formatMessage({ id: 'list-name' })}</Table.Th>
          <Table.Th isNumeric>{intl.formatMessage({ id: 'capco.section.metrics.participants' })}</Table.Th>
          <Table.Th isNumeric>{intl.formatMessage({ id: 'used-codes' })}</Table.Th>
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        {viewer.userIdentificationCodeLists?.edges
          ?.filter(Boolean)
          .map(edge => edge?.node)
          .filter(Boolean)
          .map(
            userIdentificationCodeList =>
              userIdentificationCodeList && (
                <IdentificationCodesListsTableLine
                  key={userIdentificationCodeList.id}
                  userIdentificationCodeList={userIdentificationCodeList}
                  connectionName={viewer.userIdentificationCodeLists.__id}
                />
              ),
          )}
      </Table.Tbody>
    </Table>
  )
}

export default IdentificationCodesListsTable
