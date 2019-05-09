// @flow
/* eslint-disable no-alert */
import * as React from 'react';
import { connect } from 'react-redux';
import { formValueSelector, arrayPush } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup, ListGroupItem, ButtonToolbar, Button, Row, Col } from 'react-bootstrap';
import DeleteModal from '../../Modal/DeleteModal';

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
        <span>
          <FormattedMessage id="list-realisation-steps" />
        </span>
        <ListGroup>
          {fields.map((member, index) => (
            <ListGroupItem key={index}>
              <ProposalAdminRealisationStepModal
                isCreating={!!progressSteps[index].id}
                onClose={this.handleClose}
                member={member}
                show={index === editIndex}
              />
              <DeleteModal
                closeDeleteModal={this.cancelClose}
                showDeleteModal={index === showModal}
                deleteElement={() => {
                  fields.remove(index);
                }}
                deleteModalTitle="proposal.admin.realisationStep.modal.delete"
                deleteModalContent="proposal.admin.realisationStep.modal.content"
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
                      className="btn-outline-warning"
                      onClick={() => {
                        this.setState({ editIndex: index });
                      }}>
                      <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
                    </Button>

                    <Button
                      bsStyle="danger"
                      className="btn-outline-danger"
                      onClick={() => {
                        this.setState({ showModal: index });
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
          className="box-content__toolbar"
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
  progressSteps: selector(state, 'progressSteps'),
});

export default connect(mapStateToProps)(ProposalAdminProgressSteps);
