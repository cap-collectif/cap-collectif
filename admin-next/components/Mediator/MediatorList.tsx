import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import type { MediatorList_project$key } from '@relay/MediatorList_project.graphql'
import { Text, Table, ButtonQuickAction, CapUIIcon } from '@cap-collectif/ui'
import EmptyMessage from 'components/UI/Table/EmptyMessage'
import MediatorDeleteModal, { MediatorInfos } from './MediatorDeleteModal'

export const PROJECT_LIST_PAGINATION = 20

export const MediatorListFragment = graphql`
  fragment MediatorList_project on Project @argumentDefinitions(term: { type: "String", defaultValue: null }) {
    id
    steps(excludePresentationStep: true) {
      ... on SelectionStep {
        id
        title
        mediators(username: $term, first: 50) @connection(key: "MediatorList_mediators") {
          connectionId: __id
          edges {
            node {
              totalParticipantsAccounted
              totalParticipantsOptIn
              id
              user {
                username
              }
              votes {
                totalCount
              }
              participants {
                totalCount
              }
            }
          }
        }
      }
    }
  }
`

interface MediatorListProps {
  project: MediatorList_project$key
  resetTerm: () => void
}

const MediatorList: React.FC<MediatorListProps> = ({ project: projectRef, resetTerm }) => {
  const intl = useIntl()
  const project = useFragment(MediatorListFragment, projectRef)
  const [selectedMediatorInfo, setSelectedMediatorInfo] = React.useState<null | MediatorInfos>(null)

  const stepsWithMediators = project.steps.filter(step => step?.mediators?.edges.length)
  const mediatorList = stepsWithMediators.flatMap(step =>
    step.mediators.edges.map(mediator => ({
      stepTitle: step.title,
      username: mediator.node.user.username,
      votes: mediator.node.votes,
      participants: mediator.node.participants,
      totalParticipantsAccounted: mediator.node.totalParticipantsAccounted,
      totalParticipantsOptIn: mediator.node.totalParticipantsOptIn,
      id: mediator.node.id,
      connectionId: step.mediators.connectionId,
    })),
  )

  return (
    <>
      {selectedMediatorInfo ? (
        <MediatorDeleteModal
          onClose={() => setSelectedMediatorInfo(null)}
          mediator={selectedMediatorInfo}
          projectId={project.id}
        />
      ) : null}
      <Table
        emptyMessage={
          <EmptyMessage
            onReset={() => {
              resetTerm()
            }}
          />
        }
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <Text lineHeight="sm">{intl.formatMessage({ id: 'global.mediator' })}</Text>
            </Table.Th>
            <Table.Th>
              <Text lineHeight="sm">{intl.formatMessage({ id: 'admin.label.step' })}</Text>
            </Table.Th>
            <Table.Th>
              <Text lineHeight="sm">{intl.formatMessage({ id: 'mediator.participants_count' })}</Text>
            </Table.Th>
            <Table.Th>
              <Text lineHeight="sm">{intl.formatMessage({ id: 'global.email.short' })}</Text>
            </Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {mediatorList.map(mediator => (
            <Table.Tr
              key={`${mediator.id}-${mediator.stepTitle}`}
              rowId={`${mediator.id}-${mediator.stepTitle}`}
              data-cy="mediator-item"
            >
              <Table.Td>
                <Text>{mediator.username}</Text>
              </Table.Td>
              <Table.Td>{mediator.stepTitle}</Table.Td>
              <Table.Td>{`${mediator.totalParticipantsAccounted || '0'}/${
                mediator.participants?.totalCount || '0'
              }`}</Table.Td>
              <Table.Td>{mediator.totalParticipantsOptIn || '0'}</Table.Td>
              <Table.Td>
                <ButtonQuickAction
                  variantColor="red"
                  icon={CapUIIcon.Trash}
                  label={intl.formatMessage({ id: 'action_delete' })}
                  onClick={() =>
                    setSelectedMediatorInfo({
                      id: mediator.id,
                      username: mediator.username,
                      contributions: mediator.votes?.totalCount || 0,
                      connectionId: mediator.connectionId,
                    })
                  }
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  )
}

export default MediatorList
