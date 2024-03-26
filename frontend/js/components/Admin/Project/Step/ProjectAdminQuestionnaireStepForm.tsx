import * as React from 'react'
import { fetchQuery_DEPRECATED, graphql } from 'react-relay'
import { arrayPush, Field, FieldArray } from 'redux-form'
import { connect, useSelector } from 'react-redux'
import { Button } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import component from '~/components/Form/Field'
import { renderLabel } from '../Content/ProjectContentAdminForm'
import select from '~/components/Form/Select'
import type { Dispatch, GlobalState } from '~/types'
import environment from '~/createRelayEnvironment'
import { renderSubSection } from './ProjectAdminStepForm.utils'
import type { ProjectAdminQuestionnaireStepFormQuestionnairesQueryResponse } from '~relay/ProjectAdminQuestionnaireStepFormQuestionnairesQuery.graphql'
import '~relay/ProjectAdminQuestionnaireStepFormQuestionnairesQuery.graphql'
import type { Requirement } from './StepRequirementsList'
import StepRequirementsList, { getUId } from './StepRequirementsList'
import type { FranceConnectAllowedData } from '~/components/Admin/Project/Step/ProjectAdminStepForm'
import '~/components/Admin/Project/Step/ProjectAdminStepForm'

type Props = {
  dispatch: Dispatch
  requirements?: Array<Requirement>
  questionnaire?: {
    label: string
    value: string
  }
  isAnonymousParticipationAllowed: boolean
  fcAllowedData: FranceConnectAllowedData
  isFranceConnectConfigured: boolean
  footerUsingJoditWysiwyg?: boolean | null | undefined
}
export const getAvailableQuestionnaires = graphql`
  query ProjectAdminQuestionnaireStepFormQuestionnairesQuery(
    $term: String
    $affiliations: [QuestionnaireAffiliation!]
  ) {
    viewer {
      questionnaires(query: $term, affiliations: $affiliations, availableOnly: true) {
        edges {
          node {
            id
            title
          }
        }
      }
      organizations {
        questionnaires(query: $term, affiliations: $affiliations, availableOnly: true) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    }
  }
`
export const loadQuestionnaireOptions = (
  initialValue:
    | {
        label: string
        value: string
      }
    | null
    | undefined,
  term: string | null | undefined,
  isAdmin: boolean,
): Promise<
  Array<{
    value: string
    label: string
  }>
> => {
  return fetchQuery_DEPRECATED(environment, getAvailableQuestionnaires, {
    term: term === '' ? null : term,
    affiliations: isAdmin ? null : ['OWNER'],
  }).then((data: ProjectAdminQuestionnaireStepFormQuestionnairesQueryResponse) => {
    const questionnairesEdges =
      data.viewer.organizations?.[0]?.questionnaires?.edges ?? data.viewer.questionnaires?.edges
    const questionnaires =
      questionnairesEdges
        ?.filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map(q => ({
          value: q.id,
          label: q.title,
        })) || []
    const isMatchingTerm = !term || (term && initialValue?.label?.includes(term))

    if (initialValue && !questionnaires.some(q => q.value === initialValue.value) && isMatchingTerm) {
      questionnaires.push(initialValue)
    }

    return questionnaires
  })
}
const formName = 'stepForm'
export const ProjectAdminQuestionnaireStepForm = ({
  questionnaire,
  dispatch,
  requirements,
  isAnonymousParticipationAllowed,
  fcAllowedData,
  isFranceConnectConfigured,
}: Props) => {
  const { user } = useSelector((state: GlobalState) => state.user)
  const intl = useIntl()
  const isAdmin = user?.isAdmin || false
  return (
    <>
      <Field
        type="admin-editor"
        name="footer"
        id="step-footer"
        label={renderLabel('global.footer', intl)}
        component={component}
      />
      {renderSubSection('global.questionnaire')}
      <Field
        selectFieldIsObject
        debounce
        autoload
        labelClassName="control-label"
        inputClassName="fake-inputClassName"
        component={select}
        name="questionnaire"
        id="step-questionnaire"
        placeholder=" "
        label={intl.formatMessage({
          id: 'global.questionnaire',
        })}
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="true"
        loadOptions={(term: string | null | undefined) => loadQuestionnaireOptions(questionnaire, term, isAdmin)}
        clearable
      />
      {!isAnonymousParticipationAllowed && (
        <>
          {renderSubSection('requirements')}
          <FieldArray
            name="requirements"
            component={StepRequirementsList}
            formName={formName}
            requirements={requirements}
            fcAllowedData={fcAllowedData}
            isFranceConnectConfigured={isFranceConnectConfigured}
            stepType="QuestionnaireStep"
          />
          <Button
            id="js-btn-create-step"
            bsStyle="primary"
            className="btn-outline-primary box-content__toolbar mb-20"
            onClick={() =>
              dispatch(
                arrayPush(formName, 'requirements', {
                  uniqueId: getUId(),
                  id: null,
                  type: 'CHECKBOX',
                }),
              )
            }
          >
            <i className="fa fa-plus-circle" /> <FormattedMessage id="global.add" />
          </Button>
          <Field
            type="textarea"
            name="requirementsReason"
            id="step-requirementsReason"
            label={<FormattedMessage id="reason-for-collection" />}
            component={component}
          />
        </>
      )}
    </>
  )
}
// @ts-ignore
export default connect()(ProjectAdminQuestionnaireStepForm)
