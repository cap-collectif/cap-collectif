// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { formValueSelector, arrayPush, arrayMove } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { ListGroup, ListGroupItem, ButtonToolbar, Button, Row, Col } from 'react-bootstrap';
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

type Props = {
  dispatch: Dispatch,
  fields: { length: number, map: Function, remove: Function },
  questions: Array<Object>,
  formName: string,
  intl: IntlShape,
};

type State = { editIndex: ?number };

const getItemStyle = (isDragging: boolean, draggableStyle: DraggableStyle) => ({
  userSelect: 'none',
  padding: 2,
  margin: `0 0 8px 0`,
  borderRadius: '8px',

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'grey',

  ...draggableStyle,
});

export class ProposalFormAdminQuestions extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      editIndex: null,
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    this.props.dispatch(
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

  handleSubmit = () => {
    this.setState({ editIndex: null });
  };

  render() {
    const { dispatch, fields, questions, formName, intl } = this.props;
    const { editIndex } = this.state;
    return (
      <div className="form-group" id="proposal_form_admin_questions_panel_personal">
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
                              onClose={() => {
                                this.handleClose(index);
                              }}
                              onSubmit={this.handleSubmit}
                              member={member}
                              show={index === editIndex}
                              formName={formName}
                            />
                            <Row>
                              <Col xs={8}>
                                <div>
                                  <strong>{questions[index].title}</strong>
                                  <br />
                                  <span className="excerpt">
                                    {(questions[index].type === 'text' ||
                                      questions[index].type === 'textarea' ||
                                      questions[index].type === 'editor') && (
                                      <FormattedMessage id={'global.question.types.free'} />
                                    )}
                                    {(questions[index].type === 'button' ||
                                      questions[index].type === 'radio' ||
                                      questions[index].type === 'select') && (
                                      <FormattedMessage
                                        id={'global.question.types.multiple_unique'}
                                      />
                                    )}
                                    {(questions[index].type === 'checkbox' ||
                                      questions[index].type === 'ranking') && (
                                      <FormattedMessage
                                        id={'global.question.types.multiple_multiple'}
                                      />
                                    )}
                                    {questions[index].type === 'medias' && (
                                      <FormattedMessage id={'global.question.types.other'} />
                                    )}
                                  </span>
                                </div>
                              </Col>
                              <Col xs={4}>
                                <ButtonToolbar className="pull-right">
                                  <Button
                                    bsStyle="warning"
                                    className="btn-outline-warning"
                                    onClick={() => {
                                      this.setState({ editIndex: index });
                                    }}>
                                    <i className="fa fa-pencil" />{' '}
                                    <FormattedMessage id="global.edit" />
                                  </Button>
                                  <Button
                                    bsStyle="danger"
                                    className="btn-outline-danger"
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          intl.formatMessage({ id: 'question.alert.delete' }),
                                          intl.formatMessage({
                                            id: 'question.alert.delete.bodyText',
                                          }),
                                        )
                                      ) {
                                        fields.remove(index);
                                      }
                                    }}>
                                    <i className="fa fa-trash" />
                                  </Button>
                                </ButtonToolbar>
                              </Col>
                              {provided.placeholder}
                            </Row>
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
          onClick={() => {
            dispatch(
              arrayPush(this.props.formName, 'questions', {
                private: false,
                required: false,
              }),
            );
            this.setState({ editIndex: fields.length });
          }}>
          <i className="fa fa-plus-circle" /> <FormattedMessage id="global.add" />
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
