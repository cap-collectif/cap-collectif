// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { formValueSelector, arrayMove } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup, ListGroupItem, Button, ButtonToolbar } from 'react-bootstrap';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
  DraggableStyle,
} from 'react-beautiful-dnd';
import type { GlobalState, Dispatch } from '../../../../types';
import FlashMessages from '../../../Utils/FlashMessages';

type Props = {
  dispatch: Dispatch,
  fields: { length: number, map: Function, remove: Function },
  questions: Array<Object>,
  hideSections: boolean,
  formName: string,
  intl: IntlShape,
};

type State = {
  editIndex: ?number,
  editIndexSection: ?number,
  showDeleteModal: boolean,
  deleteIndex: ?number,
  deleteType: ?string,
  flashMessages: Array<string>,
};

const getItemStyle = (draggableStyle: DraggableStyle) => ({
  userSelect: 'none',
  ...draggableStyle,
});

const getDraggableStyle = (isDragging: boolean) => ({
  background: isDragging ? '#ddd' : '',
});

// TODO: Rename to a more generic name, like FormAdminQuestions
export class ProjectStepFormAdmin extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      editIndex: null,
      editIndexSection: null,
      deleteIndex: null,
      showDeleteModal: false,
      deleteType: null,
      flashMessages: [],
    };

    this.timeoutId = null;
  }

  onDragEnd = (result: DropResult) => {
    
  };

  timeoutId: ?TimeoutID;

  handleClose = (index: number) => {
    const { fields, questions } = this.props;
    if (!questions[index].id) {
      fields.remove(index);
    }

    this.setState({
      editIndex: null,
      editIndexSection: null,
    });
  };

  handleClickDelete = (index: number, type: any) => {
    
  };

  handleDeleteAction = () => {
    
  };

  handleClickEdit = (index: number, type: any) => {
    
  };

  handleSubmit = (type: any) => {
    
  };

  handleCreateQuestion = () => {
    
  };

  handleCreateSection = () => {
    
  };

  handleCancelModal = () => {
    
  };

  render() {
    const { fields, questions, formName } = this.props;
    const { flashMessages } = this.state;

    return (
      <div className="form-group" id="proposal_form_admin_questions_panel_personal">
        {/* <ProposalFormAdminDeleteQuestionModal
          isShow={showDeleteModal}
          cancelAction={this.handleCancelModal}
          deleteAction={this.handleDeleteAction}
          deleteType={deleteType || 'question'}
        />
        */}
        <ListGroup>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided: DraggableProvided) => (
                <div ref={provided.innerRef}>
                  {fields.length === 0 && (
                    <div>
                      <FormattedMessage id="highlighted.empty" />
                    </div>
                  )}
                  {fields.map((member, index) => (
                    <Draggable
                      key={questions[index].id}
                      draggableId={questions[index].id || `new-step-${index}`}
                      index={index}>
                      {(providedDraggable: DraggableProvided, snapshot) => (
                        <div
                          ref={providedDraggable.innerRef}
                          {...providedDraggable.draggableProps}
                          {...providedDraggable.dragHandleProps}
                          style={getItemStyle(providedDraggable.draggableProps.style)}>
                          <ListGroupItem key={index} style={getDraggableStyle(snapshot.isDragging)}>
                            step {index}
                          </ListGroupItem>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ListGroup>
        <ButtonToolbar>
          <Button
            id="js-btn-create-question"
            bsStyle="primary"
            className="btn-outline-primary box-content__toolbar"
            onClick={this.handleCreateQuestion}>
            <i className="cap cap-bubble-add-2" />{' '}
            <FormattedMessage id="question_modal.create.title" />
          </Button>
        </ButtonToolbar>
        <FlashMessages className="mt-15" success={flashMessages} />
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState, props: Props) => {
  const selector = formValueSelector(props.formName);
  return {
    questions: selector(state, 'questions'),
  };
};

export default connect(mapStateToProps)(injectIntl(ProjectStepFormAdmin));
