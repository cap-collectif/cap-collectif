// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formValueSelector, arrayPush } from 'redux-form';
// import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import {
  ListGroup,
  ListGroupItem,
  ButtonToolbar,
  Button,
  Row,
  Col,
} from 'react-bootstrap';
import ProposalAdminRealisationStepModal from './ProposalAdminRealisationStepModal';
import type { GlobalState } from '../../../types';

const formName = 'proposal-admin-selections';
const selector = formValueSelector(formName);

type Props = {
  dispatch: Function,
  fields: { length: number, map: Function, remove: Function },
  progressSteps: Array<Object>,
};
type DefaultProps = void;
type State = { editIndex: ?number };

export class ProposalAdminProgessSteps extends Component<
  DefaultProps,
  Props,
  State,
> {
  state = {
    editIndex: null,
  };

  handleClose = () => {
    this.setState({ editIndex: null });
  };

  render() {
    const { dispatch, fields, progressSteps } = this.props;
    const { editIndex } = this.state;
    return (
      <div className="form-group">
        <label>Liste des phases de réalisation</label>
        <ListGroup>
          {fields.map((member, index) =>
            <ListGroupItem key={index}>
              <ProposalAdminRealisationStepModal
                isCreating={!!progressSteps[index].id}
                onClose={this.handleClose}
                member={member}
                show={index === editIndex}
              />
              <Row>
                <Col xs={10}>
                  <div>
                    <strong>
                      {progressSteps[index].title}
                    </strong>
                  </div>
                  <div className="excerpt">
                    {progressSteps[index].endAt
                      ? <p>
                          Du {moment(progressSteps[index].startAt).format(
                            'll',
                          )}{' '}
                          au {moment(progressSteps[index].endAt).format('ll')}
                        </p>
                      : moment(progressSteps[index].startAt).format('ll')}
                  </div>
                </Col>
                <Col xs={2}>
                  <ButtonToolbar>
                    <Button
                      onClick={() => {
                        this.setState({ editIndex: index });
                      }}>
                      Editer
                    </Button>
                    <Button
                      onClick={() => {
                        // eslint-disable-next-line no-confirm
                        if (
                          window.confirm(
                            'Êtes-vous sûr de vouloir supprimer cette phase de réalisation ?',
                            'Cette action est irréversible',
                          )
                        ) {
                          fields.remove(index);
                        }
                      }}>
                      Supprimer
                    </Button>
                  </ButtonToolbar>
                </Col>
              </Row>
            </ListGroupItem>,
          )}
        </ListGroup>
        <Button
          style={{ marginBottom: 10 }}
          onClick={() => {
            dispatch(arrayPush(formName, 'progressSteps', {}));
            this.setState({ editIndex: fields.length });
          }}>
          Ajouter
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  progressSteps: selector(state, 'progressSteps'),
});

export default connect(mapStateToProps)(ProposalAdminProgessSteps);
