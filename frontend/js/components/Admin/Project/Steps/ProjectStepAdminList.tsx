import * as React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import styled from 'styled-components'
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup } from 'react-bootstrap'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { createFragmentContainer, graphql } from 'react-relay'
import { formValueSelector, arrayMove } from 'redux-form'
import type { DebateType } from '~relay/DebateStepPageLogic_query.graphql'
import colors from '~/utils/colors'
import type { GlobalState, Dispatch } from '~/types'
import ProjectStepAdminItem from './ProjectStepAdminItem'
import { NoStepsPlaceholder } from '../Form/ProjectAdminForm.style'
import type { ProjectStepAdminList_project } from '~relay/ProjectStepAdminList_project.graphql'
import type { ProjectStepAdminList_query } from '~relay/ProjectStepAdminList_query.graphql'
export type Step = {
  readonly id: string | null | undefined
  readonly title: string
  readonly label: string
  readonly __typename: string | null | undefined
  readonly url: string | null | undefined
  readonly slug: string | null | undefined
  readonly debateType: DebateType
  readonly hasOpinionsFilled: boolean | null | undefined
}
export type Steps = ReadonlyArray<Step>
export type Project =
  | {
      readonly steps: Steps
    }
  | null
  | undefined
const ErrorMessage = styled.div`
  margin-bottom: 15px;
  color: ${colors.dangerColor};
`
const List = styled(ListGroup).attrs({})`
  div div .item-step {
    border-radius: 0 !important;
    border-bottom: 0 !important;
  }

  div div:first-child .item-step {
    border-top-left-radius: 4px !important;
    border-top-right-radius: 4px !important;
  }

  div div:last-child .item-step {
    border-bottom-left-radius: 4px !important;
    border-bottom-right-radius: 4px !important;
    border-bottom: 1px solid #ddd !important;
  }
`

const DroppableContainer = styled.div``

type Props = {
  fields: {
    length: number
    map: (...args: Array<any>) => any
    remove: (...args: Array<any>) => any
  }
  steps: Steps
  dispatch: Dispatch
  formName: string
  meta?: {
    error: string | null | undefined
  }
  project: ProjectStepAdminList_project
  hasIdentificationCodeLists: boolean
  query: ProjectStepAdminList_query
}
export function ProjectStepAdminList(props: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { dispatch, formName, fields, steps, meta, project, hasIdentificationCodeLists, query } = props

  React.useEffect(() => {
    const cleanup = monitorForElements({
      canMonitor: ({ source }) => source.data.type === 'step',
      onDrop: ({ source, location }) => {
        const destination = location.current.dropTargets[0]
        if (!destination) return

        const sourceData = source.data as { type: string; index: number }
        const destData = destination.data as { type: string; index: number }

        if (sourceData.type !== 'step' || destData.type !== 'step') return

        if (sourceData.index !== destData.index) {
          dispatch(arrayMove(formName, 'steps', sourceData.index, destData.index))
        }
      },
    })

    return cleanup
  }, [dispatch, formName])

  return (
    <>
      <List>
        <DroppableContainer ref={containerRef}>
          {fields.length === 0 && (
            <NoStepsPlaceholder>
              <FormattedMessage id="no-step" />
            </NoStepsPlaceholder>
          )}
          {fields.map((field: string, index: number) => (
            <ProjectStepAdminItem
              key={index}
              step={steps[index]}
              index={index}
              fields={fields}
              formName={formName}
              project={project}
              hasIdentificationCodeLists={hasIdentificationCodeLists}
              query={query}
            />
          ))}
        </DroppableContainer>
      </List>
      {meta?.error && (
        <ErrorMessage id="steps-error">
          <FormattedMessage id={meta?.error} />
        </ErrorMessage>
      )}
    </>
  )
}

const mapStateToProps = (state: GlobalState, props: Props) => {
  const selector = formValueSelector(props.formName)
  return {
    steps: selector(state, 'steps'),
  }
}

const ProjectStepAdminListConnected = connect(mapStateToProps)(ProjectStepAdminList)
export default createFragmentContainer(ProjectStepAdminListConnected, {
  project: graphql`
    fragment ProjectStepAdminList_project on Project {
      ...ProjectStepAdminItem_project
    }
  `,
  query: graphql`
    fragment ProjectStepAdminList_query on Query {
      ...ProjectStepAdminItem_query
    }
  `,
})
