// @flow
import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { injectIntl, type IntlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import QuestionnaireAdminConfigurationForm from './QuestionnaireAdminConfigurationForm';
import QuestionnaireAdminParametersForm from './QuestionnaireAdminParametersForm';
import QuestionnaireAdminResults from './QuestionnaireAdminResults';
import type { QuestionnaireAdminPageTabs_questionnaire } from './__generated__/QuestionnaireAdminPageTabs_questionnaire.graphql';

type Props = {
  questionnaire: QuestionnaireAdminPageTabs_questionnaire,
  intl: IntlShape,
};

export class QuestionnaireAdminPageTabs extends Component<Props> {
  render() {
    const { intl, questionnaire } = this.props;

    return (
      <div>
        <Tabs defaultActiveKey={1} id="proposal-form-admin-page-tabs">
          <Tab eventKey={1} title={intl.formatMessage({ id: 'questionnaire.admin.configuration' })}>
            <QuestionnaireAdminConfigurationForm questionnaire={questionnaire} />
          </Tab>
          <Tab eventKey={2} title={intl.formatMessage({ id: 'questionnaire.admin.parameters' })}>
            <QuestionnaireAdminParametersForm questionnaire={questionnaire} />
          </Tab>
          <Tab eventKey={3} title={intl.formatMessage({ id: 'results' })}>
            <QuestionnaireAdminResults
              labelColor="#fff"
              backgroundColor="#FFF"
              questionnaire={questionnaire}
            />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

const container = injectIntl(QuestionnaireAdminPageTabs);

export default createFragmentContainer(
  container,
  graphql`
    fragment QuestionnaireAdminPageTabs_questionnaire on Questionnaire {
      ...QuestionnaireAdminResults_questionnaire
      ...QuestionnaireAdminConfigurationForm_questionnaire
      ...QuestionnaireAdminParametersForm_questionnaire
    }
  `,
);
