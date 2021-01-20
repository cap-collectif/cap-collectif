// @flow
import isEmpty from 'lodash/isEmpty';
import { PROPOSAL_STATUS } from '~/constants/AnalyseConstants';
import { type Status } from '~/components/Analysis/AnalysisProposalListRole/AnalysisProposalListRole';
import { type Badge } from '~/components/User/UserAvatar';

export const getStatus = (
  analyses: ?$ReadOnlyArray<Object>,
  idUser: string,
  decisionState: Status,
  assessmentState: Status,
): Status => {
  let status = PROPOSAL_STATUS.TODO;

  if (analyses && analyses?.length > 0) {
    analyses.forEach(analyse => {
      const isAnalyseMadeByUser = analyse.analyst.id === idUser;

      if (isAnalyseMadeByUser) {
        status = PROPOSAL_STATUS[analyse.state];
      }
    });
  }
  if (
    (decisionState.name === PROPOSAL_STATUS.DONE.name ||
      assessmentState.name === PROPOSAL_STATUS.FAVOURABLE.name ||
      assessmentState.name === PROPOSAL_STATUS.UNFAVOURABLE.name) &&
    (status.name === PROPOSAL_STATUS.TODO.name || status.name === PROPOSAL_STATUS.IN_PROGRESS.name)
  ) {
    return PROPOSAL_STATUS.TOO_LATE;
  }

  return status;
};

export const getBadge = ({ icon, color }: Status, isSmall: boolean = false): Badge => ({
  icon,
  color,
  size: isSmall ? 10 : 16,
  iconSize: isSmall ? 6 : 10,
  iconColor: '#fff',
});

export const getHeadStatus = (
  analyse: ?Object,
  isDecisionMaker: boolean = false,
  decisionStatus?: Status,
): Status => {
  if (isEmpty(analyse) || !analyse) {
    if (decisionStatus && decisionStatus.name === PROPOSAL_STATUS.DONE.name) {
      return PROPOSAL_STATUS.TOO_LATE;
    }

    return PROPOSAL_STATUS.TODO;
  }

  const status = PROPOSAL_STATUS[analyse.state];

  if (
    !isDecisionMaker &&
    decisionStatus &&
    (status === PROPOSAL_STATUS.IN_PROGRESS || status === PROPOSAL_STATUS.TODO)
  ) {
    return PROPOSAL_STATUS.TOO_LATE;
  }

  if (isDecisionMaker && analyse.state === 'DONE' && analyse.isApproved) {
    return PROPOSAL_STATUS.DONE;
  }

  if (isDecisionMaker && analyse.state === 'DONE' && !analyse.isApproved) {
    return PROPOSAL_STATUS.UNFAVOURABLE;
  }

  return status;
};
