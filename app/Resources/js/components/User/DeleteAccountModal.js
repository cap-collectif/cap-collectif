// @flow
import React, { Component } from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Button, Radio } from 'react-bootstrap';
import type { MapStateToProps } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import type { DeleteAccountModal_viewer } from './__generated__/DeleteAccountModal_viewer.graphql';
import DefaultAvatar from './DefaultAvatar';
import CloseButton from '../Form/CloseButton';
import DeleteAccountMutation from '../../mutations/DeleteAccountMutation';
import type { Dispatch, State } from '../../types';
import { closeDeleteAccountModal } from '../../redux/modules/user';

const formName = 'delete-user';

type RelayProps = {
  viewer: DeleteAccountModal_viewer,
};

type Props = RelayProps & {
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
      removalType: 'SOFT',
    };
  }

  onPanelClick = (removal: string) => {
    this.setState({
      removalType: removal,
    });
  };

  delete = () => {
    DeleteAccountMutation.commit({ input: { type: this.state.removalType } }).then(() => {
      setTimeout(() => {
        window.location = `/logout?deleteType=${this.state.removalType}`;
      }, 1000);
    });
  };

  render() {
    const softPanelChecked =
      this.state.removalType === 'SOFT' ? 'panel-primary delete__panel__checked' : 'panel-default';
    const hardPanelChecked =
      this.state.removalType === 'HARD' ? 'panel-primary delete__panel__checked' : 'panel-default';
    const { show, dispatch, viewer } = this.props;
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
                  <i className="cap cap-id-8 delete__modal__icon primary" />
                </div>
                <p className="col-sm-11">
                  <FormattedHTMLMessage
                    id="alias-name-information"
                    values={{ profileLink: '/profile/edit-profile' }}
                  />
                </p>
                <div className="col-sm-1">
                  <i className="cap cap-download-12 delete__modal__icon primary" />
                </div>
                <p className="col-sm-11">
                  <FormattedHTMLMessage
                    id="data-amount-contributions-votes"
                    values={{
                      contributionsNumber: viewer.contributionsCount,
                      votesNumber: viewer.votesCount,
                      datePage: '',
                    }}
                  />
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
                  onClick={() => this.onPanelClick('SOFT')}>
                  <div className="panel-body">
                    <div className="row">
                      <div className="col-sm-7">
                        <Radio
                          value="soft"
                          name={removalName}
                          onClick={() => this.onPanelClick('SOFT')}
                          checked={this.state.removalType === 'SOFT'}>
                          <FormattedMessage id="delete-account-and-anonymize-contents" />
                        </Radio>
                        <p className="delete__content__choice">
                          <FormattedHTMLMessage
                            id="anonymizing-contributions-and-votes"
                            values={{
                              nbContributions: viewer.contributionsCount,
                              nbVotes: viewer.votesCount,
                              nbContributionsToDelete: 40,
                            }}
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
                  onClick={() => this.onPanelClick('HARD')}>
                  <div className="panel-body">
                    <div className="row">
                      <div className="col-sm-7">
                        <Radio
                          value="hard"
                          name={removalName}
                          onClick={() => this.onPanelClick('HARD')}
                          checked={this.state.removalType === 'HARD'}>
                          <FormattedMessage id="delete-account-and-contents" />
                        </Radio>
                        <p className="delete__content__choice">
                          <FormattedHTMLMessage
                            id="global-deleting-contributions-and-votes"
                            values={{
                              nbContributions: viewer.contributionsCount,
                              nbVotes: viewer.votesCount,
                            }}
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
              <i className="cap cap-attention" style={{ padding: '0 5px 0 0' }} />
              <FormattedMessage id="global.removeDefinitively" />
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

const container = connect(mapStateToProps)(DeleteAccountModal);

export default createFragmentContainer(
  container,
  graphql`
    fragment DeleteAccountModal_viewer on User {
      contributionsCount
      votesCount
    }
  `,
);
