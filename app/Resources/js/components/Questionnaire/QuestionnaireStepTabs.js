// @flow
import * as React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { injectIntl, type IntlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { type QuestionnaireAdminPageTabs_questionnaire } from './__generated__/QuestionnaireStepTabs_questionnaire.graphql';
import QuestionnaireResults from './QuestionnaireResults';
import QuestionnairePage from './QuestionnairePage';

type Props = {
  intl: IntlShape,
  questionnaire: QuestionnaireAdminPageTabs_questionnaire,
};

export class QuestionnaireStepTabs extends React.Component<Props> {
  render() {
    const { questionnaire, intl } = this.props;

    return (
      <div>
        {!questionnaire || (questionnaire && !questionnaire.privateResult) ? (
          <Tabs defaultActiveKey={1} id="user-admin-page-tabs">
            <Tab eventKey={1} title={intl.formatMessage({ id: 'project.types.questionnaire' })}>
              <QuestionnairePage questionnaire={questionnaire} />
            </Tab>
            <Tab eventKey={2} title={intl.formatMessage({ id: 'results' })}>
              <QuestionnaireResults questionnaire={questionnaire} />
            </Tab>
          </Tabs>
        ) : (
          <QuestionnairePage questionnaire={questionnaire} />
        )}
      </div>
    );
  }
}

const container = injectIntl(QuestionnaireStepTabs);

export default createFragmentContainer(container, {
  questionnaire: graphql`
    fragment QuestionnaireStepTabs_questionnaire on Questionnaire
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      privateResult
      ...QuestionnairePage_questionnaire @arguments(isAuthenticated: $isAuthenticated)
      ...QuestionnaireResults_questionnaire
    }
  `,
});
