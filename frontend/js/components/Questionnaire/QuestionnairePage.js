// @flow
import * as React from 'react';
import { injectIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import StepPageHeader from '../Steps/Page/StepPageHeader';
import UserReplies from '../Reply/UserReplies';
import ReplyCreateFormWrapper from '../Reply/Form/ReplyCreateFormWrapper';
import StepPageFooter from '../Steps/Page/StepPageFooter';
import { type QuestionnairePage_questionnaire } from '~relay/QuestionnairePage_questionnaire.graphql';

type Props = {
  questionnaire: ?QuestionnairePage_questionnaire,
};

export class QuestionnairePage extends React.Component<Props> {
  render() {
    const { questionnaire } = this.props;

    return questionnaire ? (
      <div>
        {questionnaire.step && <StepPageHeader step={questionnaire.step} />}
        <UserReplies questionnaire={questionnaire} />
        <ReplyCreateFormWrapper questionnaire={questionnaire} />
        {questionnaire.step && <StepPageFooter step={questionnaire.step} />}
      </div>
    ) : null;
  }
}

const container = injectIntl(QuestionnairePage);

export default createFragmentContainer(container, {
  questionnaire: graphql`
    fragment QuestionnairePage_questionnaire on Questionnaire
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      step {
        ...StepPageFooter_step
        ...StepPageHeader_step
      }
      ...ReplyCreateFormWrapper_questionnaire @arguments(isAuthenticated: $isAuthenticated)
      ...UserReplies_questionnaire @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
