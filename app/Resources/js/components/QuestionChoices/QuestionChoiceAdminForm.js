// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { formValueSelector, arrayPush } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { ListGroup, ListGroupItem, ButtonToolbar, Button, Row, Col } from 'react-bootstrap';
import QuestionChoiceAdminModal from './QuestionChoiceAdminModal';
import type { GlobalState, Dispatch } from '../../types';

type QuestionChoices = $ReadOnlyArray<{|
  +id: string,
  +title: string,
  +description: ?string,
  +color: ?string,
  +image: ?Object,
|}>;

type Props = {
  dispatch: Dispatch,
  fields: { length: number, map: Function, remove: Function },
  choices: QuestionChoices,
  formName: string,
  oldMember: string,
  type: string,
  intl: IntlShape,
};

type State = { editIndex: ?number };

export class QuestionChoiceAdminForm extends React.Component<Props, State> {
  state = {
    editIndex: null,
  };

  handleClose = (index: number) => {
    const { fields, choices } = this.props;
    if (!choices[index].id) {
      fields.remove(index);
    }
    this.handleSubmit();
  };

  handleSubmit = () => {
    this.setState({ editIndex: null });
  };

  render() {
    const { dispatch, fields, choices, formName, oldMember, type, intl } = this.props;
    const { editIndex } = this.state;
    return (
      <div className="form-group" id="questions_choice_panel_personal">
        <ListGroup>
          {fields.map((member, index) => (
            <ListGroupItem key={index}>
              <QuestionChoiceAdminModal
                isCreating={!!choices[index].id}
                onClose={() => {
                  this.handleClose(index);
                }}
                onSubmit={this.handleSubmit}
                member={member}
                show={index === editIndex}
                formName={formName}
                type={type}
              />
              <Row>
                <Col xs={8}>
                  <div>
                    <strong>{choices[index].title}</strong>
                  </div>
                </Col>
                <Col xs={4}>
                  <ButtonToolbar className="pull-right">
                    <Button
                      bsStyle="warning"
                      className="btn--outline"
                      onClick={() => {
                        this.setState({ editIndex: index });
                      }}>
                      <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
                    </Button>
                    <Button
                      bsStyle="danger"
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
          ))}
        </ListGroup>
        <Button
          bsStyle="primary"
          className="btn--outline box-content__toolbar"
          onClick={() => {
            dispatch(arrayPush(this.props.formName, `${oldMember}.choices`, {}));
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
    choices: selector(state, `${props.oldMember}.choices`),
  };
};

export default connect(mapStateToProps)(injectIntl(QuestionChoiceAdminForm));
