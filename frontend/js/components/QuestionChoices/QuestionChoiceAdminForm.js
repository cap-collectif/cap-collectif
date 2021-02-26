// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { arrayPush, change, formValueSelector } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { Button, ButtonToolbar, Col, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import QuestionChoiceAdminModal from './QuestionChoiceAdminModal';
import type { Dispatch, GlobalState } from '~/types';
import QuestionnaireAdminModalImportResponses from '~/components/Questionnaire/QuestionnaireAdminModalImportResponses';

type QuestionChoices = $ReadOnlyArray<{|
  +id: string,
  +title: string,
  +description: ?string,
  +color: ?string,
  +image: ?Object,
|}>;

type Props = {|
  dispatch: Dispatch,
  fields: { length: number, map: Function, remove: Function },
  choices: QuestionChoices,
  formName: string,
  oldMember: string,
  type: string,
  intl: IntlShape,
  importedResponses: Object,
|};

type State = {|
  editIndex: number,
  editMember: ?string,
  showQuestionChoiceModal: boolean,
  showModal: boolean,
  showAll: boolean,
  isCreating: boolean,
|};

export class QuestionChoiceAdminForm extends React.Component<Props, State> {
  state = {
    editIndex: 0,
    editMember: null,
    showQuestionChoiceModal: false,
    showModal: false,
    showAll: false,
    isCreating: false,
  };

  handleClose = (index: number) => {
    const { fields, choices } = this.props;
    if (!choices[index].id) {
      fields.remove(index);
    }
    this.handleSubmit();
  };

  handleSubmit = () => {
    this.setState({ editIndex: 0, showQuestionChoiceModal: false });
  };

  render() {
    const {
      dispatch,
      fields,
      choices,
      formName,
      oldMember,
      type,
      intl,
      importedResponses,
    } = this.props;
    const {
      editIndex,
      showModal,
      showAll,
      editMember,
      showQuestionChoiceModal,
      isCreating,
    } = this.state;
    const MAX_FIELDS_DISPLAYED = 10;
    return (
      <div className="form-group" id="questions_choice_panel_personal">
        {showModal && (
          <QuestionnaireAdminModalImportResponses
            show={showModal}
            formName={formName}
            type={type}
            onClose={() => {
              this.setState({ showModal: false });
              dispatch(change(formName, `${oldMember}.importedResponses`, null));
            }}
            dispatch={dispatch}
            fields={fields}
            choices={choices}
            oldMember={oldMember}
            onAdd={() => {
              const responses = choices
                ? [...importedResponses.data, ...choices]
                : [...importedResponses.data];
              dispatch(change(formName, `${oldMember}.choices`, responses));
              dispatch(change(formName, `${oldMember}.importedResponses`, null));
              this.setState({ showModal: false });
            }}
          />
        )}
        <QuestionChoiceAdminModal
          isCreating={!isCreating}
          onClose={() => {
            this.handleClose(editIndex);
          }}
          onSubmit={this.handleSubmit}
          member={editMember}
          show={showQuestionChoiceModal}
          formName={formName}
          type={type}
        />
        <ListGroup>
          {fields.map((member, index) =>
            index < MAX_FIELDS_DISPLAYED || showAll ? (
              <ListGroupItem key={index}>
                <Row>
                  <Col xs={8}>
                    <div>
                      <strong>{choices[index].title}</strong>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <ButtonToolbar className="pull-right">
                      <Button
                        id="edit-choice"
                        bsStyle="warning"
                        className="btn--outline"
                        onClick={() => {
                          this.setState({
                            editIndex: index,
                            editMember: member,
                            isCreating: false,
                            showQuestionChoiceModal: true,
                          });
                        }}>
                        <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
                      </Button>
                      <Button
                        bsStyle="danger"
                        id="remove-choice"
                        className="btn--outline"
                        onClick={() => {
                          if (
                            window.confirm(
                              intl.formatMessage({ id: 'responses.alert.delete' }),
                              intl.formatMessage({ id: 'responses.alert.delete.bodyText' }),
                            )
                          ) {
                            fields.remove(index);
                          }
                        }}>
                        <i className="fa fa-trash" />
                      </Button>
                    </ButtonToolbar>
                  </Col>
                </Row>
              </ListGroupItem>
            ) : null,
          )}
        </ListGroup>
        {fields.length > MAX_FIELDS_DISPLAYED && !showAll && (
          <div className="text-center">
            <Button
              bsStyle="default"
              onClick={() => {
                this.setState({ showAll: true });
              }}>
              <FormattedMessage id="global.more" />
            </Button>
          </div>
        )}
        <Button
          id="add-answer-in-question-button"
          bsStyle="primary"
          className="btn--outline box-content__toolbar"
          onClick={() => {
            dispatch(arrayPush(formName, `${oldMember}.choices`, {}));
            this.setState({
              editIndex: fields.length,
              isCreating: true,
              showQuestionChoiceModal: true,
              editMember: `${oldMember}.choices[${fields.length}]`,
            });
          }}>
          <i className="fa fa-plus-circle" /> <FormattedMessage id="global.add" />
        </Button>
        {type !== 'radio' && (
          <Button
            id="import_choices"
            bsStyle="primary"
            className="btn--outline box-content__toolbar ml-5"
            onClick={() => {
              this.setState({ showModal: true });
            }}>
            <i className="fa fa-upload" /> <FormattedMessage id="import" />
          </Button>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState, props: Props) => {
  const selector = formValueSelector(props.formName);
  return {
    importedResponses: selector(state, `${props.oldMember}.importedResponses`),
    choices: selector(state, `${props.oldMember}.choices`),
  };
};

export default connect<any, any, _, _, _, _>(mapStateToProps)(injectIntl(QuestionChoiceAdminForm));
