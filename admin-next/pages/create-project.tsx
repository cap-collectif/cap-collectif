import React from 'react'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import Layout from '../components/Layout/Layout'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { graphql, PreloadedQuery, usePreloadedQuery, useQueryLoader } from 'react-relay'
import { NextPage } from 'next'
import { PageProps } from '../types'
import type { createProjectQuery as createProjectQueryType } from '@relay/createProjectQuery.graphql'
import CreateProject from '../components/Projects/CreateProject/CreateProject'

export const CreateProjectQuery = graphql`
  query createProjectQuery {
    viewer {
      ...CreateProject_viewer
    }
  }
`

type CreateProjectPageProps = {
  queryReference: PreloadedQuery<createProjectQueryType>
}

const CreateProjectPage: React.FC<CreateProjectPageProps> = ({ queryReference }) => {
  const query = usePreloadedQuery(CreateProjectQuery, queryReference)
  const { viewer } = query

  return <CreateProject viewer={viewer} />
}

const CreateProjectWrapper: NextPage<PageProps> = () => {
  const [queryReference, loadQuery, disposeQuery] = useQueryLoader<createProjectQueryType>(CreateProjectQuery)
  const intl = useIntl()
  React.useEffect(() => {
    loadQuery({})

    return () => {
      disposeQuery()
    }
  }, [disposeQuery, loadQuery])

  return (
    <Layout navTitle={intl.formatMessage({ id: 'new-project' })}>
      {queryReference ? (
        <React.Suspense
          fallback={
            <Flex alignItems="center" justifyContent="center">
              <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
            </Flex>
          }
        >
          <CreateProjectPage queryReference={queryReference} />
        </React.Suspense>
      ) : null}
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default CreateProjectWrapper
