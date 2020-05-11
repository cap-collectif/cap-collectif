// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';

// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup } from 'react-bootstrap';
import {
  DragDropContext,
  Droppable,
  type DropResult,
  type DroppableProvided,
} from 'react-beautiful-dnd';
import { formValueSelector, arrayMove } from 'redux-form';
import colors from '~/utils/colors';
import type { GlobalState } from '~/types';

import ProjectStepAdminItem from './ProjectStepAdminItem';
import { NoStepsPlaceholder } from '../Form/ProjectAdminForm.style';

export type Step = {|
  +id: ?string,
  +title: string,
  +type: ?string,
  +url: ?string,
|};

export type Steps = $ReadOnlyArray<Step>;

export type Project = ?{| +steps: Steps |};

const ErrorMessage: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  margin-bottom: 15px;
  color: ${colors.dangerColor};
`;

const List: StyledComponent<{}, {}, typeof ListGroup> = styled(ListGroup).attrs({})`
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
`;

type Props = {|
  fields: { length: number, map: Function, remove: Function },
  steps: Steps,
  dispatch: Dispatch,
  formName: string,
  meta?: {| error: ?string |},
|};

export function ProjectStepAdminList(props: Props) {
  const onDragEnd = (result: DropResult) => {
    const { dispatch, formName } = props;

    // dropped outside the list
    if (!result.destination) {
      return;
    }

    dispatch(arrayMove(formName, 'steps', result.source.index, result.destination.index));
  };

  const { fields, steps, formName, meta } = props;
  return (
    <>
      <List>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided: DroppableProvided) => (
              <div ref={provided.innerRef}>
                {fields.length === 0 && (
                  <NoStepsPlaceholder>
                    <FormattedMessage id="no-step" />
                  </NoStepsPlaceholder>
                )}
                {fields.map((field: string, index: number) => (
                  <ProjectStepAdminItem
                    step={steps[index]}
                    index={index}
                    fields={fields}
                    formName={formName}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </List>
      {meta?.error && (
        <ErrorMessage id="steps-error">
          <FormattedMessage id={meta?.error} />
        </ErrorMessage>
      )}
    </>
  );
}

const mapStateToProps = (state: GlobalState, props: Props) => {
  const selector = formValueSelector(props.formName);
  return {
    steps: selector(state, 'steps'),
  };
};

export default connect(mapStateToProps)(ProjectStepAdminList);
