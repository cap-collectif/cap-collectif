import React, { useEffect, useState } from 'react'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useRouter } from 'next/router'
import { Button, CapUIIconSize, Flex, Search, Spinner } from '@cap-collectif/ui'
import { mediatorViewSelectStepQuery } from '@relay/mediatorViewSelectStepQuery.graphql'
import { mediatorViewQuery } from '@relay/mediatorViewQuery.graphql'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { useIntl } from 'react-intl'
import debounce from '@utils/debounce-promise'
import TablePlaceholder from '@ui/Table/TablePlaceholder'
import { useDisclosure } from '@liinkiing/react-hooks'
import { useNavBarContext } from '@components/NavBar/NavBar.context'
import ParticipantList from '@components/Mediator/ParticipantList'
import MediatorVoteModal from '@components/Mediator/MediatorVoteModal/MediatorVoteModal'
import Layout from '@components/Layout/Layout'
import ModalSkeleton from '@components/Mediator/MediatorVoteModal/ModalSkeleton'
import { OrderDirection } from '@relay/ParticipantListPaginationQuery.graphql'
import useUrlState from '@hooks/useUrlState'
import useFeatureFlag from '../../../hooks/useFeatureFlag'

export const QUERY = graphql`
  query mediatorViewQuery($mediatorId: ID!, $count: Int!, $cursor: String, $term: String, $orderBy: ParticipantOrder) {
    node(id: $mediatorId) {
      ... on Mediator {
        ...ParticipantList_mediator
          @arguments(term: $term, count: $count, cursor: $cursor, mediatorId: $mediatorId, orderBy: $orderBy)
      }
    }
  }
`

const MediatorView = ({ mediatorId, stepId }: { mediatorId: string; stepId: string }) => {
  const intl = useIntl()
  const [username, setUsername] = useState('')
  const [orderBy, setOrderBy] = React.useState<OrderDirection>('DESC')
  const [add] = useUrlState('add', '')

  const { isOpen, onOpen, onClose } = useDisclosure(!!add)

  const query = useLazyLoadQuery<mediatorViewQuery>(QUERY, {
    mediatorId,
    count: 20,
    cursor: null,
    term: null,
    orderBy: { field: 'CREATED_AT', direction: 'DESC' },
  })
  const onTermChange = debounce((value: string) => setUsername(value), 400)
  const mediator = query?.node

  if (!mediator) return null

  return (
    <>
      {isOpen ? (
        <React.Suspense fallback={<ModalSkeleton isNew />}>
          <MediatorVoteModal
            onClose={onClose}
            stepId={stepId}
            mediatorId={mediatorId}
            username={username}
            orderBy={orderBy}
          />
        </React.Suspense>
      ) : null}
      <Flex direction="column" spacing={6}>
        <Flex direction="column" p={8} spacing={4} m={6} bg="white" borderRadius="normal" overflow="hidden">
          <Flex>
            <Button
              id="create-participant-button"
              variant="primary"
              variantColor="primary"
              variantSize="small"
              mr={8}
              onClick={onOpen}
            >
              {intl.formatMessage({ id: 'mediator.new_participant' })}
            </Button>
            <Search
              id="search-participants"
              onChange={onTermChange}
              value={username}
              placeholder={intl.formatMessage({ id: 'mediator.search_participant' })}
            />
          </Flex>
          <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={5} />}>
            <ParticipantList
              resetTerm={() => setUsername('')}
              mediator={query?.node}
              term={username}
              stepId={stepId}
              orderBy={orderBy}
              setOrderBy={setOrderBy}
            />
          </React.Suspense>
        </Flex>
      </Flex>
    </>
  )
}

export const STEP_QUERY = graphql`
  query mediatorViewSelectStepQuery($projectId: ID!) {
    viewer {
      isMediator
      id
    }
    node(id: $projectId) {
      ... on Project {
        title
        adminAlphaUrl
        steps {
          ... on SelectionStep {
            id
            url
            mediators {
              edges {
                node {
                  id
                  user {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

/**
 * For now, we just take the first SelectionStep from the list
 * When we'll have a way (tabs ?) to select the step later on,
 * just update this component and the associated query above if needed
 */
const MediatorSelectStep = ({ projectId }: { projectId: string }) => {
  const { setBreadCrumbItems, setPreview } = useNavBarContext()
  const query = useLazyLoadQuery<mediatorViewSelectStepQuery>(STEP_QUERY, { projectId })
  const viewer = query?.viewer
  const selectionStep = query.node.steps.find(
    step => step?.mediators?.edges?.find(({ node }) => node.user.id === viewer.id)?.node.id,
  )

  useEffect(() => {
    setBreadCrumbItems([
      {
        title: query?.node?.title ?? '',
        href: query?.node?.adminAlphaUrl ?? '',
      },
    ])
    setPreview(selectionStep.url ?? '')
    return () => {
      setBreadCrumbItems([])
      setPreview(null)
    }
  }, [query, setBreadCrumbItems, setPreview, selectionStep])

  if (!projectId || !viewer || !viewer.isMediator || !selectionStep) return null

  const mediatorId = selectionStep.mediators.edges.find(({ node }) => node.user.id === viewer.id)?.node.id
  if (!mediatorId) return null

  return <MediatorView mediatorId={mediatorId} stepId={selectionStep.id} />
}

const MediatorViewPage = () => {
  const router = useRouter()
  const projectId = router.query.projectId
  const isMediatorEnabled = useFeatureFlag('mediator')

  if (!projectId) return null
  if (!isMediatorEnabled) return null

  return (
    <Layout navTitle="" hideSidebar>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <MediatorSelectStep projectId={String(projectId)} />
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default MediatorViewPage
