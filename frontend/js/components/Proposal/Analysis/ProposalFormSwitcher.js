// @flow
import React, { useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { useResize } from '@liinkiing/react-hooks';
import styled, { type StyledComponent } from 'styled-components';
import type { ProposalFormSwitcher_proposal } from '~relay/ProposalFormSwitcher_proposal.graphql';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import sizes from '~/utils/sizes';
import { CloseIcon } from './ProposalAnalysisPanel';
import ProposalAnalysisStatusLabel from './ProposalAnalysisStatusLabel';
import type { PanelState, User } from './ProposalAnalysisPanel';
import ProposalAnalysisFormPanel from './ProposalAnalysisFormPanel';
import ProposalDecisionFormPanel from './ProposalDecisionFormPanel';
import ProposalAssessmentFormPanel from './ProposalAssessmentFormPanel';
import ProposalViewAnalysisPanel from './ProposalViewAnalysisPanel';
import ProposalViewDecisionPanel from './ProposalViewDecisionPanel';
import ProposalViewAssessmentPanel from './ProposalViewAssessmentPanel';

const FormPanel: StyledComponent<{ isLarge: boolean }, {}, HTMLDivElement> = styled.div`
  overflow: scroll;
  height: calc(100vh - 70px);
  width: ${props => `calc(100vw - (100vw - (45vw - (${props.isLarge ? '95px' : '120px'}))));`};

  textarea {
    resize: none;
  }
`;

const Header: StyledComponent<{ isLarge: boolean }, {}, HTMLDivElement> = styled.div`
  position: fixed;
  z-index: 2;
  width: ${props => `calc(100vw - (100vw - (45vw - (${props.isLarge ? '95px' : '120px'}))));`};
`;

const Top: StyledComponent<{ border: boolean }, {}, HTMLDivElement> = styled.div`
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
`;

const DataStatus: StyledComponent<{ hide: boolean }, {}, HTMLDivElement> = styled.div`
  display: ${({ hide }) => hide && 'none'};
  height: 30px;
  background: ${colors.grayF4};
  text-align: center;
  font-size: 14px;
  padding: 5px;
  color: ${colors.darkGray};
`;

type Props = {|
  proposal: ProposalFormSwitcher_proposal,
  onClose: () => void,
  onBackClick: () => void,
  disabled?: boolean,
  user: User,
  panelState: PanelState,
|};

export const ProposalFormSwitcher = ({
  onClose,
  proposal,
  onBackClick,
  user,
  disabled,
  panelState,
}: Props) => {
  const [submitting, setSubmitting] = useState(false);
  const { width } = useResize();
  const isLarge = width < sizes.bootstrapGrid.mdMax;
  const finishedSubmitting = (newSubmitting, goBack) => {
    setSubmitting(newSubmitting);
    if (goBack) onBackClick();
  };
  const isView =
    panelState === 'VIEW_ANALYSIS' ||
    panelState === 'VIEW_DECISION' ||
    panelState === 'VIEW_ASSESSMENT';
  return (
    <FormPanel isLarge={isLarge}>
      <Header isLarge={isLarge}>
        <Top border={isView}>
          <Icon
            onClick={onBackClick}
            name={ICON_NAME.chevronLeft}
            size={14}
            color={colors.primaryColor}
          />
          <span>{user.displayName}</span>
          <CloseIcon onClose={onClose} />
        </Top>
        <DataStatus hide={isView}>
          {disabled ? (
            <ProposalAnalysisStatusLabel
              fontSize={8}
              iconSize={7}
              color={colors.secondaryGray}
              iconName={ICON_NAME.clock}
              text="global.filter_belated"
            />
          ) : (
            <FormattedMessage id={submitting ? 'global.saving' : 'all.data.saved'}>
              {(txt: string) => <span className={submitting ? 'saving' : 'saved'}>{txt}</span>}
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
        />
      )}
      {panelState === 'VIEW_ANALYSIS' && (
        <ProposalViewAnalysisPanel proposal={proposal} userId={user.id} />
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
  );
};

export default createFragmentContainer(ProposalFormSwitcher, {
  proposal: graphql`
    fragment ProposalFormSwitcher_proposal on Proposal {
      id
      ...ProposalAnalysisFormPanel_proposal
      ...ProposalDecisionFormPanel_proposal
      ...ProposalAssessmentFormPanel_proposal
      ...ProposalViewAnalysisPanel_proposal
      ...ProposalViewDecisionPanel_proposal
      ...ProposalViewAssessmentPanel_proposal
    }
  `,
});
