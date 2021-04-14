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
import Popover from '~ds/Popover';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import { ICON_NAME } from '~ds/Icon/Icon';
import Text from '~ui/Primitives/Text';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import DsButton from '~ds/Button/Button';
import type { Jump } from '~/components/Questionnaire/QuestionnaireAdminConfigurationForm';
import type { Questions } from '~/components/Form/Form.type';
import { formatParams } from '../Question/useDeletePopoverMessage';

type QuestionChoices = $ReadOnlyArray<{|
  +id: string,
  +title: string,
  +description: ?string,
  +color: ?string,
  +image: ?Object,
|}>;

type QuestionChoicesWithJumps = $ReadOnlyArray<{|
  +id: string,
  +title: string,
  +description: ?string,
  +color: ?string,
  +image: ?Object,
  +destinations?: Array<{
    jumpId: string,
    title: string,
  }>,
  +textParams?: {
    id: string,
    values: {
      question: string,
      question2?: string,
    },
  },
|}>;

type Jumps = $ReadOnlyArray<Jump>;

type Props = {|
  dispatch: Dispatch,
  fields: { length: number, map: Function, remove: Function },
  choices: QuestionChoices,
  jumps: Jumps,
  formName: string,
  oldMember: string,
  type: string,
  intl: IntlShape,
  importedResponses: Object,
  questions: Questions,
  currentQuestionId: string,
|};

type State = {|
  editIndex: number,
  editMember: ?string,
  showQuestionChoiceModal: boolean,
  showModal: boolean,
  showAll: boolean,
  isCreating: boolean,
  choicesWithJump: QuestionChoicesWithJumps,
|};

export class QuestionChoiceAdminForm extends React.Component<Props, State> {
  state = {
    editIndex: 0,
    editMember: null,
    showQuestionChoiceModal: false,
    showModal: false,
    showAll: false,
    isCreating: false,
    choicesWithJump: [],
  };

  componentDidMount() {
    const { jumps, choices } = this.props;

    if (!jumps) {
      return;
    }

    this.setState(() => {
      // get all the choiceId as key and an array of associated jumps
      const choicesDestinations = {};
      jumps.forEach(j => {
        j.conditions.forEach(condition => {
          const { id } = condition.value;
          if (!choicesDestinations[id]) {
            choicesDestinations[id] = [{ jumpId: j.id, title: j.destination.title }];
          } else {
            choicesDestinations[id] = [
              ...choicesDestinations[id],
              { jumpId: j.id, title: j.destination.title },
            ];
          }
        });
      });

      // loop through choices received from props to add additionnal data computed above if the choice is related to one or multiple jumps
      const choicesWithJump = choices.map(choice => {
        let choiceWithJumps = null;
        if (choicesDestinations[choice.id]) {
          const text = [...choicesDestinations[choice.id]].map(({ title }) => `"${title}"`);
          choiceWithJumps = {
            ...choice,
            destinations: [...choicesDestinations[choice.id]],
            textParams: formatParams(text, 'admin.choice.delete.confirmation.jump.body'),
          };
        }
        return choiceWithJumps || choice;
      });

      return { choicesWithJump };
    });
  }

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

  onDelete = (choiceId: string, index: number) => {
    const { choicesWithJump } = this.state;
    const choiceIndex = choicesWithJump.findIndex(c => c.id === choiceId);
    const choice = choicesWithJump[choiceIndex];

    if (!choice) return;

    const { dispatch, formName, questions, currentQuestionId, fields } = this.props;

    const questionIndex = questions.findIndex(q => q.id === currentQuestionId);
    const jumpIds = choice?.destinations?.map(({ jumpId }) => jumpId);

    const { jumps } = questions[questionIndex];
    let jumpsCount = jumps.length;
    const remainingJumps = jumps.filter(j => !jumpIds?.includes(j.id));
    this.setState({
      choicesWithJump: choicesWithJump.filter(c => c.id !== choiceId),
    });
    jumpsCount -= jumpsCount - remainingJumps.length;
    dispatch(change(formName, `questions.${questionIndex}.jumps`, remainingJumps));

    if (jumpsCount === 0) {
      dispatch(change(formName, `questions.${questionIndex}.alwaysJumpDestinationQuestion`, null));
    }

    // update questions "destinationJumps" related to this deleted choice
    questions.forEach(question => {
      const idx = questions.findIndex(q => q.id === question.id);
      const { destinationJumps } = question;
      const updatedDestinationJumps = destinationJumps.filter(dj => !jumpIds?.includes(dj.id));
      if (destinationJumps.length !== updatedDestinationJumps.length) {
        dispatch(change(formName, `questions.${idx}.destinationJumps`, updatedDestinationJumps));
      }
    });

    fields.remove(index);
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
      choicesWithJump,
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
                      {choicesWithJump?.[index]?.destinations &&
                      choicesWithJump[index].destinations.length > 0 ? (
                        <Popover placement="left" trigger={['click']} useArrow>
                          <Popover.Trigger>
                            <ButtonQuickAction
                              icon={ICON_NAME.TRASH}
                              label={<FormattedMessage id="global.delete" />}
                              variantColor="danger"
                            />
                          </Popover.Trigger>
                          <Popover.Content>
                            {({ closePopover }) => (
                              <React.Fragment>
                                <Popover.Header>
                                  <FormattedMessage id="admin.choice.delete.confirmation.header">
                                    {(text: string) => <p css={{ fontWeight: 600 }}>{text}</p>}
                                  </FormattedMessage>
                                </Popover.Header>
                                <Popover.Body>
                                  <Text>
                                    {choicesWithJump[index].textParams && (
                                      <FormattedMessage {...choicesWithJump[index].textParams} />
                                    )}
                                  </Text>
                                </Popover.Body>
                                <Popover.Footer>
                                  <ButtonGroup>
                                    <DsButton
                                      uppercase
                                      onClick={closePopover}
                                      color="gray.500"
                                      fontSize={1}>
                                      {intl.formatMessage({ id: 'cancel' })}
                                    </DsButton>
                                    <DsButton
                                      alternative
                                      variant="tertiary"
                                      variantColor="danger"
                                      onClick={() => {
                                        this.onDelete(choices[index].id, index);
                                        return closePopover?.();
                                      }}>
                                      {intl.formatMessage({ id: 'global.removeDefinitively' })}
                                    </DsButton>
                                  </ButtonGroup>
                                </Popover.Footer>
                              </React.Fragment>
                            )}
                          </Popover.Content>
                        </Popover>
                      ) : (
                        <ButtonQuickAction
                          icon={ICON_NAME.TRASH}
                          label={<FormattedMessage id="global.delete" />}
                          variantColor="danger"
                          onClick={() => {
                            if (
                              window.confirm(
                                intl.formatMessage({ id: 'responses.alert.delete' }),
                                intl.formatMessage({ id: 'responses.alert.delete.bodyText' }),
                              )
                            ) {
                              fields.remove(index);
                            }
                          }}
                        />
                      )}
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
    jumps: selector(state, `${props.oldMember}.jumps`),
    questions: selector(state, 'questions'),
  };
};

export default connect<any, any, _, _, _, _>(mapStateToProps)(injectIntl(QuestionChoiceAdminForm));
