/* eslint-disable graphql/template-strings */
/* eslint-disable relay/unused-fields */
// We need __id in order to update the connection on add and delete mutations
import React, { useEffect, useState } from 'react'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useRouter } from 'next/router'
import { Button, CapUIIconSize, Flex, Search, Spinner } from '@cap-collectif/ui'
import Layout from '@components/Layout/Layout'
import MediatorList from '@components/Mediator/MediatorList'
import { mediatorsQuery } from '@relay/mediatorsQuery.graphql'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { useIntl } from 'react-intl'
import debounce from '@shared/utils/debounce-promise'
import TablePlaceholder from '@ui/Table/TablePlaceholder'
import { useDisclosure } from '@liinkiing/react-hooks'
import MediatorCreateModal from '@components/Mediator/MediatorCreateModal'
import { useNavBarContext } from '@components/NavBar/NavBar.context'
import ProjectTabs from '@components/Projects/ProjectTabs'

export const QUERY = graphql`
  query mediatorsQuery($projectId: ID!, $username: String) {
    viewer {
      isAdmin
      isOrganizationMember
      isOnlyProjectAdmin
    }
    node(id: $projectId) {
      ... on Project {
        title
        adminAlphaUrl
        ...ProjectTabs_project
        steps(excludePresentationStep: true) {
          ... on SelectionStep {
            title
            id
            mediators(username: $username, first: 50) @connection(key: "MediatorList_mediators") {
              connectionId: __id
              edges {
                node {
                  id
                }
              }
            }
          }
        }
        ...MediatorList_project @arguments(term: $username)
      }
    }
  }
`

const MediatorsView = ({
  projectId,
  term,
  resetTerm,
  onClose,
  isOpen,
}: {
  isOpen: boolean
  onClose: () => void
  projectId: string
  term: string
  resetTerm: () => void
}) => {
  const { setBreadCrumbItems } = useNavBarContext()

  const query = useLazyLoadQuery<mediatorsQuery>(QUERY, { projectId, username: term })
  const viewer = query?.viewer

  useEffect(() => {
    setBreadCrumbItems([
      {
        title: query?.node?.title ?? '',
        href: query?.node?.adminAlphaUrl ?? '',
      },
    ])
    return () => setBreadCrumbItems([])
  }, [query, setBreadCrumbItems])

  const hasAccess = viewer?.isAdmin || viewer?.isOrganizationMember || viewer.isOnlyProjectAdmin

  if (!projectId || !hasAccess) return null

  const steps = query.node.steps
    .filter(step => step.id)
    .map(s => ({ label: s.title, value: s.id, connectionId: s.mediators.connectionId }))

  return (
    <>
      <ProjectTabs project={query?.node} />
      {isOpen ? <MediatorCreateModal onClose={onClose} options={steps} /> : null}
      <MediatorList resetTerm={resetTerm} project={query?.node} />
    </>
  )
}
const Mediators = ({ projectId }: { projectId: string }) => {
  const intl = useIntl()
  const [username, setUsername] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure(false)

  const onTermChange = debounce((value: string) => setUsername(value), 400)

  if (!projectId) return null

  return (
    <Flex direction="column" spacing={6} mt={10}>
      <Flex direction="column" p={8} m={6} bg="white" borderRadius="normal" overflow="hidden">
        <Flex direction="row" justifyContent="space-between" mb={6}>
          <Flex>
            <Button
              id="create-mediator-button"
              variant="primary"
              variantColor="primary"
              variantSize="small"
              mr={8}
              onClick={onOpen}
            >
              {intl.formatMessage({ id: 'mediator.add' })}
            </Button>
            <Search
              id="search-mediators"
              onChange={onTermChange}
              value={username}
              placeholder={intl.formatMessage({ id: 'mediator.search' })}
            />
          </Flex>
          <Button
            id="export-mediators"
            variant="secondary"
            variantColor="primary"
            variantSize="small"
            onClick={() => window?.open(`/export-project-mediators-proposals-votes/${projectId}`, '_blank')}
          >
            {intl.formatMessage({ id: 'global.export' })}
          </Button>
        </Flex>
        <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={5} />}>
          <MediatorsView
            term={username}
            resetTerm={() => setUsername('')}
            projectId={projectId}
            isOpen={isOpen}
            onClose={onClose}
          />
        </React.Suspense>
      </Flex>
    </Flex>
  )
}

const MediatorsPage = () => {
  const router = useRouter()
  const projectId = router.query.projectId

  if (!projectId) return null

  return (
    <Layout navTitle="">
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <Mediators projectId={String(projectId)} />
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default MediatorsPage
