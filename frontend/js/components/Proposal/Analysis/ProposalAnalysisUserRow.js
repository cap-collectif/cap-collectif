// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import styled, { css, type StyledComponent } from 'styled-components';
import Label from '~/components/Ui/Labels/Label';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import type { ProposalAnalysisUserRow_user } from '~relay/ProposalAnalysisUserRow_user.graphql';
import UserAvatar from '~/components/User/UserAvatar';
import type {
  ProposalDecisionState,
  ProposalAssessmentState,
  ProposalAnalysisState,
} from '~relay/ProposalAnalysisPanel_proposal.graphql';

type Status = ProposalDecisionState | ProposalAssessmentState | ProposalAnalysisState;
type Props = {|
  user: ProposalAnalysisUserRow_user,
  status: ?Status,
  canEdit: boolean,
  canConsult: boolean,
  disabled?: boolean,
  decidor?: boolean,
  onEditClick?: () => void,
|};

const Decidor: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  background: ${colors.yellow};
  width: 12px;
  height: 12px;
  border-radius: 10px;
  position: absolute;
  margin-left: 23px;
  color: ${colors.white};
  font-size: 8px;
  padding: 1px 2px;
  z-index: 1;
`;

const Row: StyledComponent<
  { disabled: boolean, decidor: boolean },
  {},
  HTMLDivElement,
> = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  > div {
    display: flex;
    align-items: center;
    width: 100%;
    div:nth-child(2) {
      font-size: 16px;
      color: ${colors.darkText};
      margin-right: 5px;
      font-weight: 600;
      max-width: calc(100% - s150px);
      word-break: break-all;
    }

    img {
      width: 32px;
      height: 32px;
      margin-right: 5px;
      border-radius: 20px;
      border: 1px solid;
    }
  }

  > svg {
    ${props => props.disabled && 'opacity: 0.2'};
  }

  > svg:hover {
    fill: ${props => !props.disabled && colors.lightBlue};
    cursor: ${props => !props.disabled && 'pointer'};
  }

  .user-avatar {
    ${({ decidor }) =>
      decidor &&
      css`
        border: 1px solid ${colors.white};
        box-shadow: 1px 1px ${colors.yellow}, -1px -1px ${colors.yellow}, -1px 1px ${colors.yellow},
          1px -1px ${colors.yellow};
      `}
  }
`;

const getLabelData = (status: ?Status) => {
  switch (status) {
    case 'NONE':
      return {
        color: colors.duckBlue,
        icon: ICON_NAME.silent,
        text: 'global.filter_not-pronounced',
      };
    case 'IN_PROGRESS':
      return { color: colors.orange, icon: ICON_NAME.ongoing, text: 'step.status.open' };
    case 'FAVOURABLE':
      return { color: colors.lightGreen, icon: ICON_NAME.favorable, text: 'global.favorable' };
    case 'UNFAVOURABLE':
      return {
        color: colors.dangerColor,
        icon: ICON_NAME.unfavorable,
        text: 'global.filter-unfavourable',
      };

    case 'TOO_LATE':
      return { color: colors.secondaryGray, icon: ICON_NAME.clock, text: 'global.filter_belated' };
    default:
      return { color: colors.lightBlue, icon: ICON_NAME.todo, text: 'global.filter_to.do' };
  }
};

export const ProposalAnalysisUserRow = ({
  user,
  status,
  canEdit,
  canConsult,
  disabled,
  decidor,
  onEditClick,
}: Props) => {
  if (!user) return null;
  const labelData = getLabelData(status);
  return (
    <>
      {decidor && <Decidor>&#9733;</Decidor>}
      <Row disabled={canEdit && disabled} decidor={decidor || false}>
        <div>
          <UserAvatar size={32} className="pull-left" user={user} />
          <div>{user.displayName}</div>
          <Label color={labelData.color} fontSize={8}>
            <Icon name={labelData.icon} size={8} color={colors.white} />
            <span className="ml-5">
              <FormattedMessage id={labelData.text} />
            </span>
          </Label>
        </div>
        {canConsult && (
          <Icon
            onClick={() => (onEditClick && canEdit && !disabled && onEditClick()) || undefined}
            name={canEdit ? ICON_NAME.pen : ICON_NAME.eye}
            size={16}
            color={colors.secondaryGray}
          />
        )}
      </Row>
    </>
  );
};

export default createFragmentContainer(ProposalAnalysisUserRow, {
  user: graphql`
    fragment ProposalAnalysisUserRow_user on User {
      id
      displayName
      ...UserAvatar_user
    }
  `,
});
