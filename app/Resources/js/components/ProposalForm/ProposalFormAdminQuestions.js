// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { formValueSelector, arrayPush, arrayMove } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { ListGroup, ListGroupItem, Button } from 'react-bootstrap';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
  DraggableStyle,
} from 'react-beautiful-dnd';
import ProposalFormAdminQuestionModal from './ProposalFormAdminQuestionModal';
import type { GlobalState, Dispatch } from '../../types';
import { ProposalFormAdminDeleteQuestionModal } from './ProposalFormAdminDeleteQuestionModal';
import { ProposalFormAdminQuestion } from './ProposalFormAdminQuestion';
import ProposalFormAdminSectionModal from './ProposalFormAdminSectionModal';

type Props = {
  dispatch: Dispatch,
  fields: { length: number, map: Function, remove: Function },
  questions: Array<Object>,
  formName: string,
  intl: IntlShape,
};

type State = {
  editIndex: ?number,
  editIndexSection: ?number,
  showDeleteModal: boolean,
  deleteIndex: ?number,
};

const getItemStyle = (isDragging: boolean, draggableStyle: DraggableStyle) => ({
  userSelect: 'none',
  padding: 2,
  margin: `0 0 8px 0`,
  borderRadius: '8px',

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : '',

  ...draggableStyle,
});

export class ProposalFormAdminQuestions extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      editIndex: null,
      editIndexSection: null,
      deleteIndex: null,
      showDeleteModal: false,
    };
  }

  onDragEnd = (result: DropResult) => {
    const { dispatch } = this.props;
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    dispatch(
      arrayMove(this.props.formName, 'questions', result.source.index, result.destination.index),
    );
  };

  handleClose = (index: number) => {
    const { fields, questions } = this.props;
    if (!questions[index].id) {
      fields.remove(index);
    }
    this.handleSubmit();
  };

  handleClickDelete = (index: number) => {
    this.setState({
      showDeleteModal: true,
      deleteIndex: index,
    });
  };

  handleDeleteAction = () => {
    const { deleteIndex } = this.state;
    const { fields } = this.props;

    fields.remove(deleteIndex);

    this.setState({
      showDeleteModal: false,
      deleteIndex: null,
    });
  };

  handleClickEdit = (index: number, type: string) => {
    if (type === 'section') {
      this.setState({ editIndexSection: index });
    } else {
      this.setState({ editIndex: index });
    }
  };

  handleSubmit = () => {
    this.setState({ editIndex: null });
    this.setState({ editIndexSection: null });
  };

  handleCreateQuestion = () => {
    const { fields, formName, dispatch } = this.props;

    dispatch(
      arrayPush(formName, 'questions', {
        private: false,
        required: false,
      }),
    );

    this.setState({ editIndex: fields.length });
  };

  handleCreateSection = () => {
    const { fields, formName, dispatch } = this.props;

    dispatch(
      arrayPush(formName, 'questions', {
        private: false,
        required: false,
        type: 'section',
      }),
    );
    this.setState({ editIndexSection: fields.length });
  };

  handleCancelModal = () => {
    this.setState({
      showDeleteModal: false,
      deleteIndex: null,
    });
  };

  render() {
    const { fields, questions, formName } = this.props;
    const { editIndex, showDeleteModal, editIndexSection } = this.state;
    return (
      <div className="form-group" id="proposal_form_admin_questions_panel_personal">
        <ProposalFormAdminDeleteQuestionModal
          isShow={showDeleteModal}
          cancelAction={this.handleCancelModal}
          deleteAction={this.handleDeleteAction}
        />
        <ListGroup>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided: DraggableProvided) => (
                <div ref={provided.innerRef}>
                  {fields.map((member, index) => (
                    <Draggable
                      key={questions[index].id}
                      draggableId={questions[index].id}
                      index={index}>
                      {(providedDraggable: DraggableProvided, snapshot) => (
                        <div
                          ref={providedDraggable.innerRef}
                          {...providedDraggable.draggableProps}
                          {...providedDraggable.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            providedDraggable.draggableProps.style,
                          )}>
                          <ListGroupItem key={index}>
                            <ProposalFormAdminQuestionModal
                              isCreating={!!questions[index].id}
                              onClose={this.handleClose.bind(this, index)}
                              onSubmit={this.handleSubmit}
                              member={member}
                              show={index === editIndex}
                              formName={formName}
                            />
                            <ProposalFormAdminSectionModal
                              show={index === editIndexSection}
                              member={member}
                              isCreating={!!questions[index].id}
                              onClose={this.handleClose.bind(this, index)}
                              onSubmit={this.handleSubmit}
                              formName={formName}
                            />
                            <ProposalFormAdminQuestion
                              question={questions[index]}
                              provided={provided}
                              handleClickEdit={this.handleClickEdit}
                              handleClickDelete={this.handleClickDelete}
                              index={index}
                            />
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
        <Button
          bsStyle="primary"
          className="btn-outline-primary box-content__toolbar"
          onClick={this.handleCreateSection}>
          <i className="cap cap-small-caps-1" /> <FormattedMessage id="create-section" />
        </Button>
        <Button
          id="js-btn-create-question"
          bsStyle="primary"
          className="btn-outline-primary box-content__toolbar"
          onClick={this.handleCreateQuestion}>
          <i className="cap cap-bubble-add-2" />{' '}
          <FormattedMessage id="question_modal.create.title" />
        </Button>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState, props: Props) => {
  const selector = formValueSelector(props.formName);
  return {
    questions: selector(state, 'questions'),
  };
};

export default connect(mapStateToProps)(injectIntl(ProposalFormAdminQuestions));
