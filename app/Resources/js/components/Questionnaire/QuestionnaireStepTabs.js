// @flow
import * as React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { connect } from 'react-redux';
import { injectIntl, type IntlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { type QuestionnaireStepTabs_questionnaire } from '~relay/QuestionnaireStepTabs_questionnaire.graphql';
import QuestionnaireResults from './QuestionnaireResults';
import QuestionnairePage from './QuestionnairePage';
import type { GlobalState } from '../../types';

type Props = {|
  enableResults: boolean,
  intl: IntlShape,
  questionnaire: QuestionnaireStepTabs_questionnaire,
|};

export class QuestionnaireStepTabs extends React.Component<Props> {
  render() {
    const { enableResults, questionnaire, intl } = this.props;

    return (
      <div>
        {enableResults && (!questionnaire || (questionnaire && !questionnaire.privateResult)) ? (
          <Tabs defaultActiveKey={1}>
            <Tab eventKey={1} title={intl.formatMessage({ id: 'project.types.questionnaire' })}>
              {/* $FlowFixMe $refType */}
              <QuestionnairePage questionnaire={questionnaire} />
            </Tab>
            <Tab eventKey={2} title={intl.formatMessage({ id: 'results' })}>
              {/* $FlowFixMe $refType */}
              <QuestionnaireResults questionnaire={questionnaire} />
            </Tab>
          </Tabs>
        ) : (
          // $FlowFixMe $refType
          <QuestionnairePage questionnaire={questionnaire} />
        )}
      </div>
    );
  }
}
const mapStateToProps = (state: GlobalState) => ({
  enableResults: state.default.features.new_feature_questionnaire_result,
});

const container = connect(mapStateToProps)(injectIntl(QuestionnaireStepTabs));

export default createFragmentContainer(container, {
  questionnaire: graphql`
    fragment QuestionnaireStepTabs_questionnaire on Questionnaire
      @argumentDefinitions(
        isAuthenticated: { type: "Boolean!" }
        enableResults: { type: "Boolean!" }
      ) {
      privateResult
      ...QuestionnairePage_questionnaire @arguments(isAuthenticated: $isAuthenticated)
      ...QuestionnaireResults_questionnaire @include(if: $enableResults)
    }
  `,
});
