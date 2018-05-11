// @flow
import React, { Component } from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Button, Radio } from 'react-bootstrap';
import type { MapStateToProps } from 'react-redux';
import CloseButton from '../Form/CloseButton';
import DefaultAvatar from './DefaultAvatar';
import DeleteAccountMutation from '../../mutations/DeleteAccountMutation';
import type { Dispatch, State } from '../../types';
import { closeDeleteAccountModal } from '../../redux/modules/user';
import type { DeleteAccountResponse } from '../../mutations/__generated__/DeleteAccountMutation.graphql';

const formName = 'delete-user';

// type FormValues = Object;

type Props = {
  show: boolean,
  dispatch: Dispatch,
};

type ModalState = {
  removalType: string,
};

export class DeleteAccountModal extends Component<Props, ModalState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      removalType: 'soft',
    };
    this.onPanelClick = this.onPanelClick.bind(this);
    this.delete = this.delete.bind(this);
  }

  onPanelClick = (removal: string) => {
    this.setState({
      removalType: removal,
    });
  };

  delete = () => {
    DeleteAccountMutation.commit({ input: { removal: this.state.removalType } }).then(
      (res: DeleteAccountResponse) => {
        window.location = res.deleteUserContributions.deleteUrl;
      },
    );
  };

  render() {
    const softPanelChecked =
      this.state.removalType === 'soft' ? 'panel-primary delete__panel__checked' : 'panel-default';
    const hardPanelChecked =
      this.state.removalType === 'hard' ? 'panel-primary delete__panel__checked' : 'panel-default';
    const { show, dispatch } = this.props;
    const removalName = 'type-of-removal';
    return (
      <div>
        <Modal
          animation={false}
          show={show}
          onHide={() => {
            dispatch(closeDeleteAccountModal());
          }}
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              <b>
                <FormattedMessage id="account-delete-confirmation" />
              </b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form name={formName}>
              <p>
                <b>
                  <FormattedMessage id="account-delete-warning" />
                </b>
              </p>
              <div className="row">
                <div className="col-sm-1">
                  <i className="cap cap-id-8 profile__contribution__icon primary" />
                </div>
                <p className="col-sm-11">
                  <FormattedMessage id="alias-name-information" />
                </p>
                <div className="col-sm-1">
                  <i className="cap cap-download-12 profile__contribution__icon primary" />
                </div>
                <p className="col-sm-11">
                  <FormattedMessage id="data-amount-contributions-votes" />
                </p>
              </div>
              <hr style={{ margin: '5px 0 15px 0' }} />
              <p>
                <b>
                  <FormattedMessage id="deleting-options" />
                </b>
              </p>
              <div>
                <div
                  className={`panel ${softPanelChecked}`}
                  onClick={() => this.onPanelClick('soft')}>
                  <div className="panel-body">
                    <div className="row">
                      <div className="col-sm-7">
                        <Radio
                          value="soft"
                          name={removalName}
                          onClick={() => this.onPanelClick('soft')}
                          checked={this.state.removalType === 'soft'}>
                          <FormattedMessage id="delete-account-and-anonymize-contents" />
                        </Radio>
                        <p className="delete__content__choice">
                          <FormattedHTMLMessage
                            id="anonymizing-contributions-and-votes"
                            values={{ nbContributions: 436, nbVotes: 42 }}
                          />
                        </p>
                      </div>
                      <div className="col-sm-5">
                        <div className="panel panel-default inception__panel">
                          <div className="panel-body">
                            <div className="row">
                              <div className="col-sm-4 delete__inception__avatar">
                                <DefaultAvatar size={35} />
                              </div>
                              <div className="col-sm-8 delete__example">
                                <FormattedMessage id="deleted-user-account" />
                                <br />
                                <strong>
                                  <FormattedMessage id="modal-example-contribution-title" />
                                </strong>
                                <br />
                                <FormattedMessage id="modal-example-contribution-content" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`panel ${hardPanelChecked}`}
                  onClick={() => this.onPanelClick('hard')}>
                  <div className="panel-body">
                    <div className="row">
                      <div className="col-sm-7">
                        <Radio
                          value="hard"
                          name={removalName}
                          onClick={() => this.onPanelClick('hard')}
                          checked={this.state.removalType === 'hard'}>
                          <FormattedMessage id="delete-account-and-contents" />
                        </Radio>
                        <p className="delete__content__choice">
                          <FormattedHTMLMessage
                            id="global-deleting-contributions-and-votes"
                            values={{ nbContributions: 436, nbVotes: 42 }}
                          />
                        </p>
                      </div>
                      <div className="col-sm-5">
                        <div className="panel panel-default inception__panel">
                          <div className="panel-body">
                            <div className="row">
                              <div className="col-sm-4 delete__inception__avatar">
                                <DefaultAvatar size={35} />
                              </div>
                              <div className="col-sm-8 delete__example">
                                <FormattedMessage id="deleted-user-account" />
                                <br />
                                <strong>
                                  <FormattedMessage id="deleted-title" />
                                </strong>
                                <br />
                                <i>
                                  <FormattedMessage id="deleted-content-by-author" />
                                </i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <CloseButton
              onClose={() => {
                dispatch(closeDeleteAccountModal());
              }}
            />
            <Button
              id="confirm-delete-form-submit"
              type="submit"
              onClick={() => {
                this.delete();
              }}
              bsStyle="danger">
              {<FormattedMessage id="global.removeDefinitively" />}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => {
  return {
    show: state.user.showDeleteAccountModal || false,
  };
};

export default connect(mapStateToProps)(DeleteAccountModal);
