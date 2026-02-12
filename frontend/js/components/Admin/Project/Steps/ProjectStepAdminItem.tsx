import * as React from 'react'
import { ListGroupItem } from 'react-bootstrap'
import { createFragmentContainer, graphql } from 'react-relay'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'

import styled from 'styled-components'
import type { Step } from './ProjectStepAdminList'
import './ProjectStepAdminList'
import ProjectStepAdminItemStep from './ProjectStepAdminItemStep'
import type { ProjectStepAdminItem_project } from '~relay/ProjectStepAdminItem_project.graphql'
import type { ProjectStepAdminItem_query } from '~relay/ProjectStepAdminItem_query.graphql'
import colors from '~/utils/colors'

type Props = {
  index: number
  step: Step
  fields: {
    length: number
    map: (...args: Array<any>) => any
    remove: (...args: Array<any>) => any
  }
  formName: string
  project: ProjectStepAdminItem_project
  hasIdentificationCodeLists: boolean
  query: ProjectStepAdminItem_query
}
const Item = styled(ListGroupItem).attrs({
  className: 'item-step',
})`
  background-color: ${colors.formBgc};
`

const DraggableWrapper = styled.div<{ isDragging?: boolean }>`
  opacity: ${props => (props.isDragging ? 0.5 : 1)};
  cursor: grab;
`

export const ProjectStepAdminItem = ({
  step,
  index,
  fields,
  formName,
  project,
  hasIdentificationCodeLists,
  query,
}: Props) => {
  const itemRef = React.useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const stepId = step?.id

  React.useEffect(() => {
    if (!step) return
    const element = itemRef.current
    if (!element) return

    const cleanupDraggable = draggable({
      element,
      getInitialData: () => ({
        type: 'step',
        id: stepId || `new-step-${index}`,
        index,
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    })

    const cleanupDropTarget = dropTargetForElements({
      element,
      getData: () => ({
        type: 'step',
        id: stepId || `new-step-${index}`,
        index,
      }),
      canDrop: ({ source }) => source.data.type === 'step',
    })

    return () => {
      cleanupDraggable()
      cleanupDropTarget()
    }
  }, [step, stepId, index])

  if (!step) {
    return null
  }

  return (
    <DraggableWrapper ref={itemRef} isDragging={isDragging}>
      <Item key={index}>
        <ProjectStepAdminItemStep
          step={step}
          index={index}
          fields={fields}
          formName={formName}
          project={project}
          hasIdentificationCodeLists={hasIdentificationCodeLists}
          query={query}
        />
      </Item>
    </DraggableWrapper>
  )
}
export default createFragmentContainer(ProjectStepAdminItem, {
  project: graphql`
    fragment ProjectStepAdminItem_project on Project {
      ...ProjectStepAdminItemStep_project
    }
  `,
  query: graphql`
    fragment ProjectStepAdminItem_query on Query {
      ...ProjectStepAdminItemStep_query
    }
  `,
})
