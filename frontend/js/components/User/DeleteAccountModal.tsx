import React, { Component } from 'react'
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl'

import styled from 'styled-components'
import { Modal, Button, Radio, Panel } from 'react-bootstrap'
import { createFragmentContainer, graphql } from 'react-relay'
import type { DeleteAccountModal_viewer } from '~relay/DeleteAccountModal_viewer.graphql'
import type { DeleteAccountType } from '~relay/DeleteAccountMutation.graphql'
import DefaultAvatar from './DefaultAvatar'
import CloseButton from '../Form/CloseButton'
import DeleteAccountMutation from '../../mutations/DeleteAccountMutation'
import { colors } from '~/utils/colors'

const formName = 'delete-user'
type RelayProps = {
  viewer: DeleteAccountModal_viewer
}
type Props = RelayProps & {
  show: boolean
  handleClose: () => void
  userDeletedIsNotViewer?: boolean
}
type ModalState = {
  removalType: DeleteAccountType
}
const DeleteDiv = styled.div`
  .radio input[type='radio'] {
    margin-left: 0;
  }
`
export class DeleteAccountModal extends Component<Props, ModalState> {
  constructor(props: Props) {
    super(props)
    this.state = {
      removalType: 'SOFT',
    }
  }

  onPanelClick = (removal: DeleteAccountType) => {
    this.setState({
      removalType: removal,
    })
  }

  delete = async () => {
    const { userDeletedIsNotViewer, viewer } = this.props
    const { removalType } = this.state

    if (userDeletedIsNotViewer) {
      DeleteAccountMutation.commit({
        input: {
          type: removalType,
          userId: viewer.id,
        },
      }).then(() => {
        setTimeout(() => {
          window.location.href = `/admin/capco/user/user/list`
        }, 1000)
      })
    } else {
      const { csrfToken } = await fetch('/profile/delete-account/csrf-token').then(response => response.json())
      window.location.href = `/profile/deleteAccount/${removalType}?csrfToken=${csrfToken}`
    }
  }

  render() {
    const { removalType } = this.state
    const softPanelChecked = removalType === 'SOFT' ? 'delete__panel__checked' : ''
    const hardPanelChecked = removalType === 'HARD' ? 'delete__panel__checked' : ''
    const { show, viewer, handleClose } = this.props
    const removalName = 'type-of-removal'
    return (
      <div>
        <Modal
          animation={false}
          show={show}
          onHide={() => {
            handleClose()
          }}
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              <h2 style={{ color: colors.black, fontWeight: 'bold' }}>
                <FormattedMessage id="account-delete-confirmation" />
              </h2>
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
                    values={{
                      profileLink: '/profile/edit-profile',
                    }}
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
              <hr
                style={{
                  margin: '5px 0 15px 0',
                }}
              />
              <p>
                <b>
                  <FormattedMessage id="deleting-options" />
                </b>
              </p>
              <fieldset>
                <legend className="sr-only">
                  <FormattedMessage id="deleting-options" />
                </legend>
                <Panel
                  bsStyle={softPanelChecked ? 'primary' : 'default'}
                  className={softPanelChecked}
                  onClick={() => this.onPanelClick('SOFT')}
                >
                  <Panel.Body id="delete-account-soft">
                    <div className="row">
                      <DeleteDiv className="col-sm-7">
                        <Radio
                          value="soft"
                          className="ml-15"
                          name={removalName}
                          onClick={() => this.onPanelClick('SOFT')}
                          checked={removalType === 'SOFT'}
                        >
                          <div className="ml-20">
                            <FormattedMessage id="delete-account-and-anonymize-contents" />
                          </div>
                        </Radio>
                        <p className="delete__content__choice">
                          <FormattedHTMLMessage
                            id="anonymizing-contributions-and-votes"
                            values={{
                              nbContributions: viewer.contributionsCount,
                              nbVotes: viewer.votes.totalCount,
                              // TODO Request the number of events created by the user once feature available
                              nbEvents: 0,
                              nbContributionsToDelete: viewer.contributionsToDeleteCount,
                            }}
                          />
                        </p>
                      </DeleteDiv>
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
                  onClick={() => this.onPanelClick('HARD')}
                >
                  <Panel.Body id="delete-account-hard">
                    <div className="row">
                      <DeleteDiv className="col-sm-7">
                        <Radio
                          value="hard"
                          className="ml-15"
                          name={removalName}
                          onClick={() => this.onPanelClick('HARD')}
                          checked={removalType === 'HARD'}
                        >
                          <div className="ml-20">
                            <FormattedMessage id="delete-account-and-contents" />
                          </div>
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
                      </DeleteDiv>
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
              </fieldset>

            </form>
          </Modal.Body>
          <Modal.Footer>
            <CloseButton
              onClose={() => {
                handleClose()
              }}
            />
            <Button
              id="confirm-delete-form-submit"
              type="submit"
              onClick={() => {
                this.delete()
              }}
              bsStyle="danger"
            >
              <i
                className="cap cap-attention"
                style={{
                  padding: '0 5px 0 0',
                }}
              />
              <FormattedMessage id="global.removeDefinitively" />
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
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
})
