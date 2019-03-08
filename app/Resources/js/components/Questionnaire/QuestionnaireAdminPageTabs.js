// @flow
import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { injectIntl, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import QuestionnaireAdminConfigurationForm from './QuestionnaireAdminConfigurationForm';
import QuestionnaireAdminParametersForm from './QuestionnaireAdminParametersForm';
import QuestionnaireAdminResults from './QuestionnaireAdminResults';
import type { QuestionnaireAdminPageTabs_questionnaire } from './__generated__/QuestionnaireAdminPageTabs_questionnaire.graphql';
import type { State } from '../../types';

type Props = {|
  enableResultsTab: boolean,
  questionnaire: QuestionnaireAdminPageTabs_questionnaire,
  intl: IntlShape,
|};

export class QuestionnaireAdminPageTabs extends Component<Props> {
  render() {
    const { intl, questionnaire, enableResultsTab } = this.props;

    return (
      <div>
        <Tabs defaultActiveKey={1} id="proposal-form-admin-page-tabs">
          <Tab eventKey={1} title={intl.formatMessage({ id: 'questionnaire.admin.configuration' })}>
            <QuestionnaireAdminConfigurationForm questionnaire={questionnaire} />
          </Tab>
          <Tab eventKey={2} title={intl.formatMessage({ id: 'questionnaire.admin.parameters' })}>
            <QuestionnaireAdminParametersForm questionnaire={questionnaire} />
          </Tab>
          {enableResultsTab ? (
            <Tab eventKey={3} title={intl.formatMessage({ id: 'results' })}>
              <QuestionnaireAdminResults
                labelColor="#fff"
                backgroundColor="#FFF"
                questionnaire={questionnaire}
              />
            </Tab>
          ) : null}
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  enableResultsTab: state.default.features.new_feature_questionnaire_result,
});

const container = connect(mapStateToProps)(injectIntl(QuestionnaireAdminPageTabs));

export default createFragmentContainer(
  container,
  graphql`
    fragment QuestionnaireAdminPageTabs_questionnaire on Questionnaire {
      ...QuestionnaireAdminResults_questionnaire @include(if: $enableResultsTab)
      ...QuestionnaireAdminConfigurationForm_questionnaire
      ...QuestionnaireAdminParametersForm_questionnaire
    }
  `,
);
