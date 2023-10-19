import * as React from 'react'
import { FieldArray } from 'redux-form'
import { createFragmentContainer, graphql } from 'react-relay'
import { ButtonToolbar } from 'react-bootstrap'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, useIntl } from 'react-intl'
import ProjectStepAdminList from './ProjectStepAdminList'
import ProjectAdminStepFormModal from '../Step/ProjectAdminStepFormModal'
import { ProjectBoxHeader, ProjectBoxContainer } from '../Form/ProjectAdminForm.style'
import { STEP_TYPES } from '~/constants/StepTypeConstants'
import type { StepTypes } from '../Form/ProjectAdminForm'
import type { ProjectStepAdmin_project } from '~relay/ProjectStepAdmin_project.graphql'
import type { ProjectStepAdmin_query } from '~relay/ProjectStepAdmin_query.graphql'
import Menu from '../../../DesignSystem/Menu/Menu'
import Button from '~ds/Button/Button'
import Text from '~ui/Primitives/Text'

type Props = ReduxFormFormProps & {
  form: string
  intl: IntlShape
  project: ProjectStepAdmin_project
  query: ProjectStepAdmin_query
  viewerIsAdmin: boolean
  hasIdentificationCodeLists: boolean
}
export const validate = ({ steps }: StepTypes) => {
  const errors: any = {}

  /* AbstractStep */
  const titles = steps.map(s => s.title.toLowerCase())

  if (titles.some((item, index) => titles.indexOf(item) !== index)) {
    errors.steps = {
      _error: 'unique-step-title',
    }
  }

  /* QuestionnaireStep */
  const questionnaires = steps.filter(s => s.__typename === 'QuestionnaireStep').map(s => s.questionnaire?.value)

  if (questionnaires.some((item, index) => questionnaires.indexOf(item) !== index)) {
    errors.steps = {
      _error: 'duplicate-questionnaire',
    }
  }

  return errors
}
export const ProjectStepAdmin = ({ form, project, viewerIsAdmin, hasIdentificationCodeLists, query }: Props) => {
  const intl = useIntl()
  const [stepType, setStepType] = React.useState('OtherStep')
  const [showAddStepModal, displayAddStepModal] = React.useState(false)
  const stepTypes = React.useMemo(() => {
    const excludedSteps = ['RankingStep']
    const hasCollectStep = !!project.firstCollectStep?.id

    if (!viewerIsAdmin) {
      excludedSteps.push('ConsultationStep')
    }

    return STEP_TYPES.filter(step => !excludedSteps.includes(step.value)).map(step => {
      if (!hasCollectStep && step.value === 'SelectionStep') {
        return { ...step, disabled: true }
      }

      return step
    })
  }, [project.firstCollectStep?.id, viewerIsAdmin])
  return (
    <div className="col-md-12">
      <ProjectBoxContainer className="box container-fluid">
        <ProjectBoxHeader>
          <FormattedMessage id="project.show.meta.step.title" tagName="h4" />
        </ProjectBoxHeader>

        <div className="box-content">
          <div className="form-group" id="project_form_admin_steps_panel">
            <FieldArray
              name="steps"
              component={ProjectStepAdminList}
              formName={form}
              project={project}
              hasIdentificationCodeLists={hasIdentificationCodeLists}
              query={query}
            />
            <ButtonToolbar>
              <ProjectAdminStepFormModal
                onClose={() => displayAddStepModal(false)}
                step={null}
                isCreating
                type={stepType}
                show={showAddStepModal}
                form={form}
                project={project}
                hasIdentificationCodeLists={hasIdentificationCodeLists}
                query={query}
              />
              <Menu closeOnSelect placement="bottom-start">
                <Menu.Button>
                  <Button id="js-btn-create-step" variant="secondary" variantSize="small" variantColor="primary">
                    <i
                      className="fa fa-plus-circle"
                      style={{
                        marginRight: '4px',
                      }}
                    />
                    <FormattedMessage id="global.add" />
                  </Button>
                </Menu.Button>

                <Menu.List id="create-step-list">
                  {stepTypes.map((st, idx) => (
                    <Menu.ListItem
                      as="li"
                      key={idx}
                      id={st.label}
                      disabled={st.disabled || false}
                      onClick={() => {
                        setStepType(st.value)
                        displayAddStepModal(true)
                      }}
                    >
                      <Text>
                        {intl.formatMessage({
                          id: st.label,
                        })}
                      </Text>
                    </Menu.ListItem>
                  ))}
                </Menu.List>
              </Menu>
            </ButtonToolbar>
          </div>
        </div>
      </ProjectBoxContainer>
    </div>
  )
}
export default createFragmentContainer(ProjectStepAdmin, {
  project: graphql`
    fragment ProjectStepAdmin_project on Project {
      firstCollectStep {
        id
      }
      ...ProjectAdminStepFormModal_project
      ...ProjectStepAdminList_project
    }
  `,
  query: graphql`
    fragment ProjectStepAdmin_query on Query {
      ...ProjectAdminStepFormModal_query
      ...ProjectStepAdminList_query
    }
  `,
})
