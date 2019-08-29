// @flow
import React, { Component } from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Modal, Button, Radio, Panel } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';
import type { DeleteAccountModal_viewer } from '~relay/DeleteAccountModal_viewer.graphql';
import type { DeleteAccountType } from '~relay/DeleteAccountMutation.graphql';
import DefaultAvatar from './DefaultAvatar';
import CloseButton from '../Form/CloseButton';
import DeleteAccountMutation from '../../mutations/DeleteAccountMutation';

const formName = 'delete-user';

type RelayProps = {|
  viewer: DeleteAccountModal_viewer,
|};

type Props = {|
  ...RelayProps,
  show: boolean,
  handleClose: () => void,
  redirectToAdminUrl: boolean,
  userDeletedIsNotViewer: boolean,
|};

type ModalState = {
  removalType: DeleteAccountType,
};

export class DeleteAccountModal extends Component<Props, ModalState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      removalType: 'SOFT',
    };
  }

  onPanelClick = (removal: DeleteAccountType) => {
    this.setState({
      removalType: removal,
    });
  };

  delete = () => {
    const { redirectToAdminUrl, userDeletedIsNotViewer, viewer } = this.props;
    const { removalType } = this.state;
    DeleteAccountMutation.commit({
      input: { type: removalType, userId: viewer.id },
    }).then(() => {
      setTimeout(() => {
        if (redirectToAdminUrl && userDeletedIsNotViewer) {
          window.location.href = `/admin/capco/user/user/list`;
        } else {
          window.location.href = `/logout?deleteType=${removalType}`;
        }
      }, 1000);
    });
  };

  render() {
    const { removalType } = this.state;
    const softPanelChecked = removalType === 'SOFT' ? 'delete__panel__checked' : '';
    const hardPanelChecked = removalType === 'HARD' ? 'delete__panel__checked' : '';
    const { show, viewer, handleClose } = this.props;
    const removalName = 'type-of-removal';
    return (
      <div>
        <Modal
          animation={false}
          show={show}
          onHide={() => {
            handleClose();
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
                      votesNumber: viewer.votes.totalCount,
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
                <Panel
                  bsStyle={softPanelChecked ? 'primary' : 'default'}
                  className={softPanelChecked}
                  onClick={() => this.onPanelClick('SOFT')}>
                  <Panel.Body id="delete-account-soft">
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
                              nbVotes: viewer.votes.totalCount,
                              nbContributionsToDelete: viewer.contributionsToDeleteCount,
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
                                <FormattedMessage id="deleted-user" />
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
                  </Panel.Body>
                </Panel>
                <Panel
                  bsStyle={hardPanelChecked ? 'primary' : 'default'}
                  className={hardPanelChecked}
                  onClick={() => this.onPanelClick('HARD')}>
                  <Panel.Body id="delete-account-hard">
                    <div className="row">
                      <div className="col-sm-7">
                        <Radio
                          value="hard"
                          name={removalName}
                          onClick={() => this.onPanelClick('HARD')}
                          checked={removalType === 'HARD'}>
                          <FormattedMessage id="delete-account-and-contents" />
                        </Radio>
                        <p className="delete__content__choice">
                          <FormattedHTMLMessage
                            id="global-deleting-contributions-and-votes"
                            values={{
                              nbContributions: viewer.contributionsCount,
                              nbVotes: viewer.votes.totalCount,
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
                                <FormattedMessage id="deleted-user" />
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
                  </Panel.Body>
                </Panel>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <CloseButton
              onClose={() => {
                handleClose();
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

export default createFragmentContainer(DeleteAccountModal, {
  viewer: graphql`
    fragment DeleteAccountModal_viewer on User {
      contributionsCount
      votes {
        totalCount
      }
      contributionsToDeleteCount
      id
    }
  `,
});
