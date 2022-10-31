// @flow
import React, { useState } from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage, injectIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import UserReplies from '../Reply/UserReplies/UserReplies';
import ReplyCreateFormWrapper from '../Reply/Form/ReplyCreateFormWrapper';
import { type QuestionnairePage_questionnaire } from '~relay/QuestionnairePage_questionnaire.graphql';
import { type QuestionnairePage_query } from '~relay/QuestionnairePage_query.graphql';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import QuestionnaireHeader from '~/components/Questionnaire/QuestionnaireHeader';
import QuestionnaireFooter from '~/components/Questionnaire/QuestionnaireFooter';

type Props = {|
  +questionnaire: ?QuestionnairePage_questionnaire,
  +query: ?QuestionnairePage_query,
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

export const QuestionnairePage = ({ questionnaire, query }: Props) => {
  const [isShow, setIsShow] = useState(false);

  const hasAnonymousReplies = query?.anonymousReplies
    ? query.anonymousReplies.filter(Boolean).length > 0
    : false;
  const hasViewerReplies =
    questionnaire?.viewerReplies && questionnaire.viewerReplies.totalCount > 0;
  const hasReplies = hasAnonymousReplies || hasViewerReplies;

  const showAnswerOnceText = !questionnaire?.multipleRepliesAllowed && hasReplies;
  const showAnswerAgainButton = questionnaire?.multipleRepliesAllowed && !isShow && hasReplies;
  const showCreateForm = (questionnaire?.multipleRepliesAllowed && isShow) || !hasReplies;

  return questionnaire && query ? (
    <QuestionnaireContainer id="questionnaire-page">
      {questionnaire.step && <QuestionnaireHeader step={questionnaire.step} />}
      <UserReplies questionnaire={questionnaire} query={query} />

      {showAnswerOnceText && (
        <div className="wrapper-replies-max">
          <Icon name={ICON_NAME.information} size={16} color={colors.infoColor} />
          <FormattedMessage id="reply.user_has_reply.error" />
        </div>
      )}

      {showAnswerAgainButton && (
        <button type="button" onClick={() => setIsShow(true)} className="btn-answer-again">
          <FormattedMessage id="answer-again" />
        </button>
      )}

      {showCreateForm && (
        <ReplyCreateFormWrapper questionnaire={questionnaire} setIsShow={setIsShow} />
      )}

      {questionnaire.step && <QuestionnaireFooter step={questionnaire.step} />}
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
        ...QuestionnaireHeader_step
        ... on QuestionnaireStep {
          ...QuestionnaireFooter_step
        }
      }
      viewerReplies @include(if: $isAuthenticated) {
        totalCount
      }
      ...ReplyCreateFormWrapper_questionnaire @arguments(isAuthenticated: $isAuthenticated)
      ...UserReplies_questionnaire @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
  query: graphql`
    fragment QuestionnairePage_query on Query
    @argumentDefinitions(
      anonymousRepliesIds: { type: "[ID!]!" }
      isNotAuthenticated: { type: "Boolean!" }
    ) {
      ...UserReplies_query
        @arguments(
          anonymousRepliesIds: $anonymousRepliesIds
          isNotAuthenticated: $isNotAuthenticated
        )
      anonymousReplies: nodes(ids: $anonymousRepliesIds) @include(if: $isNotAuthenticated) {
        __typename
      }
    }
  `,
});
