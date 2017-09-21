// @flow
/* eslint-disable no-alert */
import * as React from 'react';
import { connect } from 'react-redux';
import { formValueSelector, arrayPush } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import { ListGroup, ListGroupItem, ButtonToolbar, Button, Row, Col } from 'react-bootstrap';
import RealisationStepDeleteModal from './RealisationStepDeleteModal';

import ProposalAdminRealisationStepModal from './ProposalAdminRealisationStepModal';
import type { GlobalState, Dispatch } from '../../../types';

const formName = 'proposal-admin-selections';
const selector = formValueSelector(formName);

type Props = {
  dispatch: Dispatch,
  fields: { length: number, map: Function, remove: Function },
  progressSteps: Array<Object>,
};
type DefaultProps = void;
type State = { editIndex: ?number, showModal: ?number };

export class ProposalAdminProgressSteps extends React.Component<Props, State> {
  static defaultProps: DefaultProps;
  state = {
    editIndex: null,
    showModal: null,
  };

  handleClose = () => {
    this.setState({ editIndex: null });
  };

  cancelClose = () => {
    this.setState({ showModal: null });
  };

  render() {
    const { dispatch, fields, progressSteps } = this.props;
    const { editIndex, showModal } = this.state;

    return (
      <div className="form-group">
        <label>Liste des phases de réalisation</label>
        <ListGroup>
          {fields.map((member, index) => (
            <ListGroupItem key={index}>
              <ProposalAdminRealisationStepModal
                isCreating={!!progressSteps[index].id}
                onClose={this.handleClose}
                member={member}
                show={index === editIndex}
              />
              <RealisationStepDeleteModal
                closeModalDelete={this.cancelClose}
                showModalDelete={index === showModal}
                deleteProgressStep={() => {
                  fields.remove(index);
                }}
              />
              <Row>
                <Col xs={8}>
                  <div>
                    <strong>{progressSteps[index].title}</strong>
                  </div>
                  {progressSteps[index].startAt && (
                    <div className="excerpt">
                      {progressSteps[index].endAt ? (
                        <span>
                          Du {moment(progressSteps[index].startAt).format('ll')} au{' '}
                          {moment(progressSteps[index].endAt).format('ll')}
                        </span>
                      ) : (
                        moment(progressSteps[index].startAt).format('ll')
                      )}
                    </div>
                  )}
                </Col>
                <Col xs={4}>
                  <ButtonToolbar className="pull-right">
                    <Button
                      bsStyle="warning"
                      onClick={() => {
                        this.setState({ editIndex: index });
                      }}>
                      <FormattedMessage id="global.edit" />
                    </Button>

                    <Button
                      bsStyle="danger"
                      onClick={() => {
                        this.setState({ showModal: index });
                      }}>
                      <FormattedMessage id="global.remove" />
                    </Button>
                  </ButtonToolbar>
                </Col>
              </Row>
            </ListGroupItem>
          ))}
        </ListGroup>
        <Button
          style={{ marginBottom: 10 }}
          onClick={() => {
            dispatch(arrayPush(formName, 'progressSteps', {}));
            this.setState({ editIndex: fields.length });
          }}>
          <FormattedMessage id="global.add" />
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  // show: state.user.showConfirmDeleteModal,
  progressSteps: selector(state, 'progressSteps'),
});

export default connect(mapStateToProps)(ProposalAdminProgressSteps);
