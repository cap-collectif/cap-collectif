import * as React from 'react'
import { NextPage } from 'next'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { PageProps } from 'types'
import Layout from '@components/BackOffice/Layout/Layout'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useRouter } from 'next/router'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { OrgIdQuery } from '@relay/OrgIdQuery.graphql'
import OrganizationConfigForm from '@components/BackOffice/Organizations/OrganizationConfig/OrganizationConfigForm'

export interface OrganisationConfigPageProps {
  orgId: string
}

export const QUERY = graphql`
  query OrgIdQuery($id: ID!) {
    node(id: $id) {
      ... on Organization {
        id
        ...OrganizationConfigForm_organization
      }
    }
  }
`

const OrganisationConfigPage: React.FC<OrganisationConfigPageProps> = ({ orgId }) => {
  const response = useLazyLoadQuery<OrgIdQuery>(QUERY, { id: orgId })
  if (!response.node) return null

  return <OrganizationConfigForm organization={response.node} />
}

const OrganizationConfig: NextPage<PageProps> = ({}) => {
  const intl = useIntl()
  const router = useRouter()
  const { orgId } = router.query as { orgId: string }
  if (orgId) {
    return (
      <Layout navTitle={intl.formatMessage({ id: 'global.all.organisation' })}>
        <React.Suspense
          fallback={
            <Flex alignItems="center" justifyContent="center">
              <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
            </Flex>
          }
        >
          <OrganisationConfigPage orgId={orgId} />
        </React.Suspense>
      </Layout>
    )
  }
  return null
}

export const getServerSideProps = withPageAuthRequired

export default OrganizationConfig
