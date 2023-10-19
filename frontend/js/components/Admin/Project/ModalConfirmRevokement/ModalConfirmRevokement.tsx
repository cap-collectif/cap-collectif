import { $Values } from 'utility-types'
import * as React from 'react'
import isEqual from 'lodash/isEqual'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { Modal } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import CloseButton from '~/components/Form/CloseButton'
import SubmitButton from '~/components/Form/SubmitButton'
import type { Uuid } from '~/types'
import { TYPE_ROLE } from '~/constants/AnalyseConstants'
import RevokeAnalystsToProposalsMutation from '~/mutations/RevokeAnalystsToProposalsMutation'
import AssignSupervisorToProposalsMutation from '~/mutations/AssignSupervisorToProposalsMutation'
import AssignDecisionMakerToProposalsMutation from '~/mutations/AssignDecisionMakerToProposalsMutation'
import { useProjectAdminProposalsContext } from '~/components/Admin/Project/ProjectAdminPage.context'
import type { AnalystRevoked_analyst } from '~relay/AnalystRevoked_analyst.graphql'
import AnalystRevoked from '~/components/Admin/Project/ModalConfirmRevokement/AnalystRevoked'
import type { Analyst, DecisionMaker, Supervisor } from '~/components/Admin/Project/ProjectAdminProposals.utils'
const AnalystRevokedList: StyledComponent<any, {}, HTMLUListElement> = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  padding: 0;
  margin: 15px 0 0 0;

  .analyst-revoked-container {
    margin-bottom: 10px;
  }
`
export type AnalystsDisplay = ReadonlyArray<
  AnalystRevoked_analyst & {
    id: string
  }
>
type Props = {
  show: boolean
  onClose: () => void
  analystsRevoked: Uuid[]
  analystAssigned?: Uuid | null | undefined
  selectedProposals: ReadonlyArray<Uuid>
  type: $Values<typeof TYPE_ROLE>
  analystsWithAnalyseBegin: ReadonlyArray<Analyst | Supervisor | DecisionMaker>
}

const revokeAnalysts = (analystsRemoved, selectedProposals) =>
  RevokeAnalystsToProposalsMutation.commit({
    input: {
      analystIds: analystsRemoved,
      proposalIds: selectedProposals,
    },
  })

const assignSupervisor = (supervisor, selectedProposals) =>
  AssignSupervisorToProposalsMutation.commit({
    input: {
      supervisorId: supervisor,
      proposalIds: selectedProposals,
    },
  })

const assignDecisionMaker = (decisionMaker, selectedProposals) =>
  AssignDecisionMakerToProposalsMutation.commit({
    input: {
      decisionMakerId: decisionMaker,
      proposalIds: selectedProposals,
    },
  })

const ModalConfirmRevokement = ({
  show,
  onClose,
  analystsRevoked,
  analystAssigned,
  analystsWithAnalyseBegin,
  selectedProposals,
  type,
}: Props) => {
  const { dispatch } = useProjectAdminProposalsContext()
  const [analystsDisplay, setAnalystsDisplay] = React.useState<AnalystsDisplay>([])

  const handleSubmit = async () => {
    onClose()
    dispatch({
      type: 'START_LOADING',
    })

    switch (type) {
      case TYPE_ROLE.ANALYST:
        await revokeAnalysts(analystsRevoked, selectedProposals)
        break

      case TYPE_ROLE.SUPERVISOR:
        await assignSupervisor(analystAssigned, selectedProposals)
        break

      case TYPE_ROLE.DECISION_MAKER:
        await assignDecisionMaker(analystAssigned, selectedProposals)
        break

      default:
        break
    }

    dispatch({
      type: 'STOP_LOADING',
    })
  }

  React.useEffect(() => {
    const analystsRemovedWithAnalyseBegin = analystsRevoked
      .filter(analystId => analystsWithAnalyseBegin.some(({ id }) => id === analystId))
      .map(analystId => analystsWithAnalyseBegin.find(({ id }) => id === analystId)) as any as AnalystsDisplay

    if (!isEqual(analystsRemovedWithAnalyseBegin, analystsDisplay)) {
      setAnalystsDisplay(analystsRemovedWithAnalyseBegin)
    }
  }, [analystsRevoked, analystsDisplay, analystsWithAnalyseBegin])
  return (
    <Modal animation={false} show={show} onHide={onClose} bsSize="large" aria-labelledby="contained-modal-title-lg">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-lg">
          <FormattedMessage id="revoke.confirmation" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormattedMessage
          id="delete.analysis.confirmation"
          values={{
            num: analystsDisplay.length,
          }}
        />

        <AnalystRevokedList>
          {analystsDisplay.map(analyst => (
            <AnalystRevoked key={analyst.id} analyst={analyst} />
          ))}
        </AnalystRevokedList>
      </Modal.Body>
      <Modal.Footer>
        <CloseButton onClose={onClose} label="editor.undo" />
        <SubmitButton label="revoke.definitively" onSubmit={handleSubmit} bsStyle="danger" />
      </Modal.Footer>
    </Modal>
  )
}

export default createFragmentContainer(ModalConfirmRevokement, {
  analystsWithAnalyseBegin: graphql`
    fragment ModalConfirmRevokement_analystsWithAnalyseBegin on User @relay(plural: true) {
      id
      ...AnalystRevoked_analyst
    }
  `,
})
