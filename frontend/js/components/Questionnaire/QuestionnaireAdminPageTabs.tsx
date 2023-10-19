import React, { Component } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import type { IntlShape } from 'react-intl'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { createFragmentContainer, graphql } from 'react-relay'
import QuestionnaireAdminConfigurationForm from './QuestionnaireAdminConfigurationForm'
import QuestionnaireAdminParametersForm from './QuestionnaireAdminParametersForm'
import QuestionnaireAdminResults from './QuestionnaireAdminResults'
import QuestionnaireAdminNotifications from './QuestionnaireAdminNotifications'
import type { QuestionnaireAdminPageTabs_questionnaire } from '~relay/QuestionnaireAdminPageTabs_questionnaire.graphql'
import type { State } from '~/types'
import type { QuestionnaireAdminPageTabs_viewer } from '~relay/QuestionnaireAdminPageTabs_viewer.graphql'

type Props = {
  enableResultsTab: boolean
  questionnaire: QuestionnaireAdminPageTabs_questionnaire
  viewer: QuestionnaireAdminPageTabs_viewer
  intl: IntlShape
}
export class QuestionnaireAdminPageTabs extends Component<Props> {
  render() {
    const { intl, questionnaire, enableResultsTab, viewer } = this.props
    return (
      <div>
        <Tabs defaultActiveKey={1} id="proposal-form-admin-page-tabs">
          <Tab
            eventKey={1}
            title={intl.formatMessage({
              id: 'global.configuration',
            })}
          >
            <QuestionnaireAdminConfigurationForm questionnaire={questionnaire} />
          </Tab>
          <Tab
            eventKey={2}
            title={intl.formatMessage({
              id: 'global.params',
            })}
          >
            <QuestionnaireAdminParametersForm questionnaire={questionnaire} />
          </Tab>
          {enableResultsTab ? (
            <Tab
              eventKey={3}
              title={intl.formatMessage({
                id: 'results',
              })}
            >
              {/* @ts-expect-error */}
              <QuestionnaireAdminResults labelColor="#fff" backgroundColor="#FFF" questionnaire={questionnaire} />
            </Tab>
          ) : null}
          <Tab
            eventKey={4}
            title={intl.formatMessage({
              id: 'global.notifications',
            })}
          >
            <QuestionnaireAdminNotifications questionnaire={questionnaire} viewer={viewer} />
          </Tab>
        </Tabs>
      </div>
    )
  }
}

const mapStateToProps = (state: State) => ({
  enableResultsTab: state.default.features.beta__questionnaire_result,
})

// @ts-ignore
const container = connect<any, any>(mapStateToProps)(injectIntl(QuestionnaireAdminPageTabs))
export default createFragmentContainer(container, {
  questionnaire: graphql`
    fragment QuestionnaireAdminPageTabs_questionnaire on Questionnaire {
      ...QuestionnaireAdminResults_questionnaire @include(if: $enableResultsTab)
      ...QuestionnaireAdminConfigurationForm_questionnaire
      ...QuestionnaireAdminParametersForm_questionnaire
      ...QuestionnaireAdminNotifications_questionnaire
    }
  `,
  viewer: graphql`
    fragment QuestionnaireAdminPageTabs_viewer on User {
      ...QuestionnaireAdminNotifications_viewer
    }
  `,
})
