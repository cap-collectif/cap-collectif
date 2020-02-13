// @flow
import * as React from 'react';
import { injectIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import StepPageHeader from '../Steps/Page/StepPageHeader';
import UserReplies from '../Reply/UserReplies/UserReplies';
import ReplyCreateFormWrapper from '../Reply/Form/ReplyCreateFormWrapper';
import StepPageFooter from '../Steps/Page/StepPageFooter';
import { type QuestionnairePage_questionnaire } from '~relay/QuestionnairePage_questionnaire.graphql';

type Props = {|
  questionnaire: ?QuestionnairePage_questionnaire,
|};

export const QuestionnairePage = ({ questionnaire }: Props) =>
  questionnaire ? (
    <>
      {questionnaire.step && <StepPageHeader step={questionnaire.step} />}
      <UserReplies questionnaire={questionnaire} />
      {(questionnaire.multipleRepliesAllowed ||
        (questionnaire.viewerReplies && questionnaire.viewerReplies.length === 0)) && (
        <ReplyCreateFormWrapper questionnaire={questionnaire} />
      )}
      {questionnaire.step && <StepPageFooter step={questionnaire.step} />}
    </>
  ) : null;

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
        id
      }
      ...ReplyCreateFormWrapper_questionnaire @arguments(isAuthenticated: $isAuthenticated)
      ...UserReplies_questionnaire @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
