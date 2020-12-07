// @flow
import React, { useState } from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage, injectIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import UserReplies from '../Reply/UserReplies/UserReplies';
import StepPageHeader from '../Steps/Page/StepPageHeader/StepPageHeader';
import ReplyCreateFormWrapper from '../Reply/Form/ReplyCreateFormWrapper';
import StepPageFooter from '../Steps/Page/StepPageFooter';
import { type QuestionnairePage_questionnaire } from '~relay/QuestionnairePage_questionnaire.graphql';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';

type Props = {|
  questionnaire: ?QuestionnairePage_questionnaire,
|};

export const QuestionnaireContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  .btn-answer-again {
    color: #fff;
    background-color: ${colors.primaryColor};
    border-radius: 4px;
    border: none;
    padding: 6px 15px;
  }

  .wrapper-replies-max {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    color: ${colors.infoColor};

    svg {
      margin-right: 8px;
    }
  }
`;

const hasViewerReplies = viewerReplies => viewerReplies && viewerReplies.totalCount > 0;

export const QuestionnairePage = ({ questionnaire }: Props) => {
  const [isShow, setIsShow] = useState(false);

  return questionnaire ? (
    <QuestionnaireContainer>
      {questionnaire.step && <StepPageHeader step={questionnaire.step} />}
      <UserReplies questionnaire={questionnaire} />

      {!questionnaire.multipleRepliesAllowed && hasViewerReplies(questionnaire.viewerReplies) && (
        <div className="wrapper-replies-max">
          <Icon name={ICON_NAME.information} size={16} color={colors.infoColor} />
          <FormattedMessage id="reply.user_has_reply.error" />
        </div>
      )}

      {questionnaire.multipleRepliesAllowed &&
        !isShow &&
        hasViewerReplies(questionnaire.viewerReplies) && (
          <button type="button" onClick={() => setIsShow(true)} className="btn-answer-again">
            <FormattedMessage id="answer-again" />
          </button>
        )}

      {((questionnaire.multipleRepliesAllowed && isShow) ||
        (questionnaire.viewerReplies && questionnaire.viewerReplies.totalCount === 0) ||
        !questionnaire.viewerReplies) && (
        <ReplyCreateFormWrapper questionnaire={questionnaire} setIsShow={setIsShow} />
      )}

      {questionnaire.step && <StepPageFooter step={questionnaire.step} />}
    </QuestionnaireContainer>
  ) : null;
};

const container = injectIntl(QuestionnairePage);

export default createFragmentContainer(container, {
  questionnaire: graphql`
    fragment QuestionnairePage_questionnaire on Questionnaire
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      multipleRepliesAllowed
      step {
        ...StepPageFooter_step
        ...StepPageHeader_step
      }
      viewerReplies @include(if: $isAuthenticated) {
        totalCount
      }
      ...ReplyCreateFormWrapper_questionnaire @arguments(isAuthenticated: $isAuthenticated)
      ...UserReplies_questionnaire @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
