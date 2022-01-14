// @flow
import * as React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';
import { Draggable, type DraggableProvided } from 'react-beautiful-dnd';
import styled, { type StyledComponent } from 'styled-components';
import { type Step } from './ProjectStepAdminList';
import ProjectStepAdminItemStep from './ProjectStepAdminItemStep';
import type { ProjectStepAdminItem_project } from '~relay/ProjectStepAdminItem_project.graphql';
import type { ProjectStepAdminItem_query } from '~relay/ProjectStepAdminItem_query.graphql';
import colors from '~/utils/colors';

type Props = {|
  index: number,
  step: Step,
  fields: { length: number, map: Function, remove: Function },
  formName: string,
  project: ProjectStepAdminItem_project,
  hasIdentificationCodeLists: boolean,
  query: ProjectStepAdminItem_query,
|};

const Item: StyledComponent<{}, {}, typeof ListGroupItem> = styled(ListGroupItem).attrs({
  className: 'item-step',
})`
  background-color: ${colors.formBgc};
`;

export const ProjectStepAdminItem = ({ step, index, fields, formName, project, hasIdentificationCodeLists, query }: Props) => (
  <Draggable key={step.id} draggableId={step.id || `new-step-${index}`} index={index}>
    {(providedDraggable: DraggableProvided) => (
      <div
        ref={providedDraggable.innerRef}
        {...providedDraggable.draggableProps}
        {...providedDraggable.dragHandleProps}>
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
      </div>
    )}
  </Draggable>
);

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
});
