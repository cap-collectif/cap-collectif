// @ts-nocheck
import React, { useState } from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import styled from 'styled-components'
import type { ProposalFormSwitcher_proposal } from '~relay/ProposalFormSwitcher_proposal.graphql'
import colors from '~/utils/colors'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import { CloseIcon } from './ProposalAnalysisPanelCloseIcon'
import ProposalAnalysisStatusLabel from './ProposalAnalysisStatusLabel'
import type { PanelState, User } from './types'
import ProposalAnalysisFormPanel from './ProposalAnalysisFormPanel'
import ProposalDecisionFormPanel from './ProposalDecisionFormPanel'
import ProposalAssessmentFormPanel from './ProposalAssessmentFormPanel'
import ProposalViewAnalysisPanel from './ProposalViewAnalysisPanel'
import ProposalViewDecisionPanel from './ProposalViewDecisionPanel'
import ProposalViewAssessmentPanel from './ProposalViewAssessmentPanel'
import { MAIN_BORDER_RADIUS_SIZE } from '~/utils/styles/variables'
import type { ProposalFormSwitcher_viewer } from '~relay/ProposalFormSwitcher_viewer.graphql'

const FormPanel = styled.div`
  overflow: scroll;
  height: calc(100vh - 50px);
  width: 400px;

  textarea {
    resize: none;
  }

  .multiple-majority-container {
    flex-direction: column;
    text-align: center;

    .majority-container {
      &:first-of-type {
        border-radius: ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE} 0 0;
      }

      &:last-of-type {
        border-radius: 0 0 ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE};
      }
    }
  }
`
const Header = styled.div<{
  hide: boolean
}>`
  position: ${({ hide }) => hide && 'fixed'};
  z-index: 2;
  width: 400px;
`
const Top = styled.div<{
  border: boolean
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
  font-size: 16px;
  font-weight: 600;
  color: ${colors.darkText};
  padding: 20px;
  text-align: center;
  z-index: 2;
  background: ${colors.white};
  border-bottom: ${({ border }) => border && `1px solid ${colors.lightGray}`};
  > svg:hover {
    cursor: pointer;
  }

  span {
    max-width: 80%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`
const DataStatus = styled.div<{
  hide: boolean
}>`
  display: ${({ hide }) => hide && 'none'};
  height: 30px;
  background: ${colors.grayF4};
  text-align: center;
  font-size: 14px;
  padding: 5px;
  color: ${colors.darkGray};
`
type Props = {
  proposal: ProposalFormSwitcher_proposal
  onClose: () => void
  onBackClick: () => void
  disabled?: boolean
  user: User
  panelState: PanelState
  viewer: ProposalFormSwitcher_viewer
}
export type SubmittingState = 'SAVED' | 'SAVING' | 'DRAFT_SAVED' | 'DRAFT_SAVING' | 'ERROR'
const stateToKey = {
  SAVED: 'all.data.saved',
  SAVING: 'global.saving',
  DRAFT_SAVED: 'label.draft.saved',
  DRAFT_SAVING: 'label.draft.being.saved',
  ERROR: 'global.invalid.form',
}
export const ProposalFormSwitcher = ({ onClose, proposal, onBackClick, user, disabled, panelState, viewer }: Props) => {
  const [submittingState, setSubmittingState] = useState<SubmittingState | null | undefined>(null)

  const finishedSubmitting = (newSubmitting: SubmittingState, goBack: boolean) => {
    setSubmittingState(newSubmitting)
    if (goBack) onBackClick()
  }

  const isView = panelState === 'VIEW_ANALYSIS' || panelState === 'VIEW_DECISION' || panelState === 'VIEW_ASSESSMENT'
  return (
    <FormPanel>
      <Header hide={isView}>
        <Top border={isView}>
          <Icon onClick={onBackClick} name={ICON_NAME.chevronLeft} size={14} color={colors.primaryColor} />
          <span>{user.displayName}</span>
          <CloseIcon onClose={onClose} />
        </Top>
        <DataStatus hide={isView || !submittingState}>
          {disabled ? (
            <ProposalAnalysisStatusLabel
              fontSize={8}
              iconSize={7}
              color={colors.secondaryGray}
              iconName={ICON_NAME.clock}
              text="global.filter_belated"
            />
          ) : (
            <FormattedMessage id={stateToKey[submittingState || 'SAVED']}>
              {(txt: string) => (
                <span
                  className={submittingState === 'SAVING' || submittingState === 'DRAFT_SAVING' ? 'saving' : 'saved'}
                >
                  {txt}
                </span>
              )}
            </FormattedMessage>
          )}
        </DataStatus>
      </Header>
      {panelState === 'EDIT_ANALYSIS' && (
        <ProposalAnalysisFormPanel
          proposal={proposal}
          disabled={disabled}
          userId={user.id}
          onValidate={finishedSubmitting}
          viewer={viewer}
        />
      )}
      {panelState === 'VIEW_ANALYSIS' && (
        <ProposalViewAnalysisPanel proposal={proposal} userId={user.id} viewer={viewer} />
      )}
      {panelState === 'EDIT_ASSESSMENT' && (
        <ProposalAssessmentFormPanel
          proposal={proposal}
          disabled={disabled}
          displayName
          onValidate={finishedSubmitting}
        />
      )}
      {panelState === 'VIEW_ASSESSMENT' && <ProposalViewAssessmentPanel proposal={proposal} />}
      {panelState === 'EDIT_DECISION' && (
        <ProposalDecisionFormPanel
          proposal={proposal}
          disabled={disabled}
          displayName
          onValidate={finishedSubmitting}
        />
      )}
      {panelState === 'VIEW_DECISION' && <ProposalViewDecisionPanel proposal={proposal} />}
    </FormPanel>
  )
}
export default createFragmentContainer(ProposalFormSwitcher, {
  viewer: graphql`
    fragment ProposalFormSwitcher_viewer on User {
      ...ProposalViewAnalysisPanel_viewer
      ...ProposalAnalysisFormPanel_viewer
    }
  `,
  proposal: graphql`
    fragment ProposalFormSwitcher_proposal on Proposal
    @argumentDefinitions(proposalRevisionsEnabled: { type: "Boolean!" }) {
      id
      ...ProposalAnalysisFormPanel_proposal @arguments(proposalRevisionsEnabled: $proposalRevisionsEnabled)
      ...ProposalDecisionFormPanel_proposal @arguments(proposalRevisionsEnabled: $proposalRevisionsEnabled)
      ...ProposalAssessmentFormPanel_proposal @arguments(proposalRevisionsEnabled: $proposalRevisionsEnabled)
      ...ProposalViewAnalysisPanel_proposal
      ...ProposalViewDecisionPanel_proposal
      ...ProposalViewAssessmentPanel_proposal
    }
  `,
})
