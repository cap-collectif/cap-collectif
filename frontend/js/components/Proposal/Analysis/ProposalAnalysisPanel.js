// @flow
import React, { useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { type StyledComponent } from 'styled-components';
import ProposalAnalysisUserRow from './ProposalAnalysisUserRow';
import type { ProposalAnalysisPanel_proposal } from '~relay/ProposalAnalysisPanel_proposal.graphql';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import type { State } from '~/types';
import ProposalFormSwitcher from './ProposalFormSwitcher';

const CloseIconContainer: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  right: 30px;
  z-index: 1;
  border: none;
  padding: 0;
  background: none;

  :hover {
    cursor: pointer;
  }
`;

const PanelsSlider: StyledComponent<{ home: boolean }, {}, HTMLDivElement> = styled.div`
  display: flex;
  width: 200%;
  margin-left: ${props => (props.home ? 0 : '-100%')};
  transition: 0.5s;
`;

const Panel: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  background: ${colors.white};
  margin-left: 30px;
  margin-right: 30px;
  padding-top: 30px;
`;

const PanelSection: StyledComponent<{ border?: boolean }, {}, HTMLDivElement> = styled.div`
  > p {
    font-size: 20px;
    color: ${colors.secondaryGray};
    margin-bottom: 15px;
  }

  padding-bottom: 15px;
  border-bottom: ${props => props.border && `1px solid ${colors.lightGray}`};
  margin-bottom: 15px;
`;

const CloseIconWrapper: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  > p {
    font-size: 20px;
    color: ${colors.secondaryGray};
    margin-bottom: 15px;
  }
`;

export type User = {| id: string, displayName: string |};

type Props = {|
  proposal: ProposalAnalysisPanel_proposal,
  onClose: () => void,
  user: User,
|};

export type PanelState =
  | 'HOME'
  | 'EDIT_ANALYSIS'
  | 'VIEW_ANALYSIS'
  | 'EDIT_ASSESSMENT'
  | 'VIEW_ASSESSMENT'
  | 'EDIT_DECISION'
  | 'VIEW_DECISION';

export const CloseIcon = ({ onClose }: { onClose: () => void }) => (
  <CloseIconContainer onClick={onClose}>
    <Icon name={ICON_NAME.close} size={16} color={colors.secondaryGray} />
  </CloseIconContainer>
);

export const ProposalAnalysisPanel = ({ proposal, onClose, user }: Props) => {
  const [panelState, setPanelState] = useState<PanelState>('HOME');
  const [panelViewUser, setPanelViewUser] = useState<User>(user);

  if (!proposal.analysts || !user) return null;
  const analysts = proposal.analysts.filter(analyst => analyst.id !== user.id);
  const userAnalyst = proposal.analysts?.find(analyst => analyst.id === user.id);
  if (userAnalyst) analysts.unshift(userAnalyst);
  const closed = proposal.decision?.state === 'DONE';
  const proposalState = proposal.assessment?.state;
  const decisionState =
    proposal.decision?.state === 'IN_PROGRESS'
      ? 'IN_PROGRESS'
      : proposal.decision?.isApproved === false
      ? 'UNFAVOURABLE'
      : proposal.decision?.isApproved
      ? 'FAVOURABLE'
      : undefined;
  return (
    <PanelsSlider home={panelState === 'HOME'} id="proposal_analysis_panel">
      <div style={{ width: '50%' }}>
        <Panel>
          <PanelSection border>
            <CloseIconWrapper>
              <FormattedMessage id="panel.analysis.subtitle" tagName="p" />
              <CloseIcon
                onClose={() => {
                  setPanelState('HOME');
                  onClose();
                }}
              />
            </CloseIconWrapper>
            <div>
              {analysts?.map((analyst, idx) => {
                const status = proposal.analyses?.find(a => a.updatedBy.id === analyst.id);
                const disabled =
                  (proposalState && proposalState !== 'IN_PROGRESS') ||
                  closed ||
                  status === 'TOO_LATE';
                return (
                  <div className="mt-10">
                    <ProposalAnalysisUserRow
                      canConsult={
                        !!status ||
                        (proposal.viewerCanAnalyse &&
                          !idx &&
                          !(closed || (proposalState && proposalState !== 'IN_PROGRESS')))
                      }
                      canEdit={proposal.viewerCanAnalyse && !idx && !disabled}
                      disabled={
                        !status && (closed || (proposalState && proposalState !== 'IN_PROGRESS'))
                      }
                      user={analyst}
                      status={status?.state}
                      onClick={(view: ?boolean) => {
                        setPanelViewUser({
                          id: analyst.id || '',
                          displayName: analyst.displayName || '',
                        });
                        setPanelState(view ? 'VIEW_ANALYSIS' : 'EDIT_ANALYSIS');
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </PanelSection>
          {proposal.supervisor && (
            <PanelSection border>
              <FormattedMessage id="global.review" tagName="p" />
              <div>
                <ProposalAnalysisUserRow
                  canConsult={!!proposal.assessment?.state || proposal.viewerCanEvaluate}
                  canEdit={proposal.viewerCanEvaluate}
                  onClick={(view: ?boolean) => {
                    setPanelViewUser({
                      id: proposal.supervisor?.id || '',
                      displayName: proposal.supervisor?.displayName || '',
                    });
                    setPanelState(view ? 'VIEW_ASSESSMENT' : 'EDIT_ASSESSMENT');
                  }}
                  disabled={closed || proposal.assessment?.state === 'TOO_LATE'}
                  user={proposal.supervisor}
                  status={proposal.assessment?.state}
                />
              </div>
            </PanelSection>
          )}
          {proposal.decisionMaker && (
            <PanelSection id="proposal_analysis_decision">
              <FormattedMessage id="global.decision" tagName="p" />
              <div>
                <ProposalAnalysisUserRow
                  canConsult={!!proposal.decision?.state || proposal.viewerCanDecide}
                  canEdit={proposal.viewerCanDecide}
                  user={proposal.decisionMaker}
                  status={decisionState}
                  decidor
                  onClick={(view: ?boolean) => {
                    setPanelViewUser({
                      id: proposal.decisionMaker?.id || '',
                      displayName: proposal.decisionMaker?.displayName || '',
                    });
                    setPanelState(view ? 'VIEW_DECISION' : 'EDIT_DECISION');
                  }}
                />
              </div>
            </PanelSection>
          )}
        </Panel>
      </div>
      <ProposalFormSwitcher
        proposal={proposal}
        onClose={onClose}
        onBackClick={() => setPanelState('HOME')}
        disabled={false}
        user={panelViewUser}
        panelState={panelState}
      />
    </PanelsSlider>
  );
};

const mapStateToProps = (state: State) => ({
  user: { id: state.user.user?.id || '', displayName: state.user.user?.username || '' },
});

export default createFragmentContainer(connect(mapStateToProps)(ProposalAnalysisPanel), {
  proposal: graphql`
    fragment ProposalAnalysisPanel_proposal on Proposal {
      id
      ...ProposalFormSwitcher_proposal
      analysts {
        id
        displayName
        ...ProposalAnalysisUserRow_user
      }
      decisionMaker {
        id
        displayName
        ...ProposalAnalysisUserRow_user
      }
      supervisor {
        id
        displayName
        ...ProposalAnalysisUserRow_user
      }
      analyses {
        id
        state
        updatedBy {
          id
        }
      }
      assessment {
        state
        id
        updatedBy {
          id
        }
      }
      decision {
        id
        state
        updatedBy {
          id
        }
        isApproved
      }

      viewerCanDecide
      viewerCanAnalyse
      viewerCanEvaluate
    }
  `,
});
