import React, { useState } from 'react'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl'
import { ButtonToolbar, Button, Row, Col } from 'react-bootstrap'
import { createFragmentContainer, graphql } from 'react-relay'
import type { Step } from './ProjectStepAdminList'
import './ProjectStepAdminList'
import ProjectAdminStepFormModal from '../Step/ProjectAdminStepFormModal'
import type { ProjectStepAdminItemStep_project } from '~relay/ProjectStepAdminItemStep_project.graphql'
import type { ProjectStepAdminItemStep_query } from '~relay/ProjectStepAdminItemStep_query.graphql'
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon'
import Text from '~ui/Primitives/Text'
import Flex from '~ui/Primitives/Layout/Flex'
import { getContributionsPath } from '~/components/Admin/Project/ProjectAdminContributions/IndexContributions/IndexContributions'
import { getProjectAdminPath } from '~/components/Admin/Project/ProjectAdminPage.utils'

type Props = {
  step: Step
  index: number
  formName: string
  fields: {
    length: number
    map: (...args: Array<any>) => any
    remove: (...args: Array<any>) => any
  }
  project: ProjectStepAdminItemStep_project
  hasIdentificationCodeLists: boolean
  query: ProjectStepAdminItemStep_query
}
const ItemQuestionWrapper: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  padding-right: 8px;
`
const StepRow: StyledComponent<any, {}, typeof Row> = styled(Row)`
  .btn-outline-danger.btn-danger {
    width: 33px;
    padding: 6px;
  }
`
const EditButton: StyledComponent<any, {}, typeof Button> = styled(Button).attrs({
  className: 'btn-edit btn-outline-warning',
})`
  width: 33px;
  padding: 6px;
  color: #333 !important;
  border: 1px solid #333 !important;
  background: #fff !important;
`

const onDeleteStep = (fields, index) => {
  fields.remove(index)
}

const getWordingStep = (type: string) =>
  type === 'DebateStep' ? 'global.debate' : `${type.slice(0, -4).toLowerCase()}_step`

export const ProjectStepAdminItemStep = ({
  step,
  index,
  fields,
  formName,
  project,
  hasIdentificationCodeLists,
  query,
}: Props) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const hasSelectionStep = project.steps.some(s => s.__typename === 'SelectionStep')
  const disabledDelete = step.__typename === 'CollectStep' && hasSelectionStep
  return (
    <StepRow>
      <Col xs={8} className="d-flex align-items-center">
        <ItemQuestionWrapper>
          <i
            className="cap cap-android-menu"
            style={{
              color: '#aaa',
              fontSize: '20px',
            }}
          />
        </ItemQuestionWrapper>
        <ItemQuestionWrapper>
          <strong>{step.title || step.label}</strong>
          <br />
          <span className="excerpt">
            {step.__typename && <FormattedMessage id={getWordingStep(step.__typename)} />}
          </span>

          {step.__typename === 'DebateStep' &&
            step.slug &&
            !step.hasOpinionsFilled &&
            step.debateType === 'FACE_TO_FACE' && (
              <>
                <br />
                <Flex
                  direction="row"
                  bg="blue.100"
                  py={1}
                  px={2}
                  align="center"
                  borderRadius="normal"
                  border="normal"
                  borderColor="blue.150"
                  spacing={2}
                  marginTop={2}
                >
                  <Icon name={ICON_NAME.CIRCLE_INFO} color="blue.500" size={ICON_SIZE.SM} />

                  <Text color="blue.800">
                    <FormattedHTMLMessage
                      id="finalize.face.to.face.configuration"
                      values={{
                        link: getContributionsPath(
                          getProjectAdminPath(project._id, 'CONTRIBUTIONS'),
                          'DebateStep',
                          step.id || '',
                          step.slug,
                        ),
                      }}
                    />
                  </Text>
                </Flex>
              </>
            )}
        </ItemQuestionWrapper>
      </Col>

      <Col xs={4}>
        <ButtonToolbar className="pull-right">
          <EditButton bsStyle="warning" onClick={() => setShowEditModal(true)} id={`js-btn-edit-${index}`}>
            <i className="fa fa-pencil" />
          </EditButton>
          <Button
            bsStyle="danger"
            id={`js-btn-delete-${index}`}
            className="btn-outline-danger"
            onClick={() => onDeleteStep(fields, index)}
            disabled={disabledDelete}
          >
            <i className="fa fa-trash" />
          </Button>
          <ProjectAdminStepFormModal
            onClose={() => setShowEditModal(false)}
            step={step}
            type={step.__typename || 'OtherStep'}
            show={showEditModal}
            form={formName}
            index={index}
            project={project}
            hasIdentificationCodeLists={hasIdentificationCodeLists}
            query={query}
          />
        </ButtonToolbar>
      </Col>
    </StepRow>
  )
}
export default createFragmentContainer(ProjectStepAdminItemStep, {
  project: graphql`
    fragment ProjectStepAdminItemStep_project on Project {
      _id
      steps {
        __typename
      }
      ...ProjectAdminStepFormModal_project
    }
  `,
  query: graphql`
    fragment ProjectStepAdminItemStep_query on Query {
      ...ProjectAdminStepFormModal_query
    }
  `,
})
