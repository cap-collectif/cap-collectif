import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import { Button, Modal } from 'react-bootstrap'
import type { OpinionBodyDiffModal_modal } from '~relay/OpinionBodyDiffModal_modal.graphql'
import WYSIWYGRender from '../Form/WYSIWYGRender'
import Tooltip from '~ds/Tooltip/Tooltip'

type Props = {
  link: string
  modal: OpinionBodyDiffModal_modal
}
type State = {
  showModal: boolean
}

class OpinionBodyDiffModal extends React.Component<Props, State> {
  state = {
    showModal: false,
  }

  open = () => {
    this.setState({
      showModal: true,
    })
  }

  close = () => {
    this.setState({
      showModal: false,
    })
  }

  render() {
    const { link, modal } = this.props
    const { showModal } = this.state
    return (
      <span>
        <Tooltip
          label={<FormattedMessage id="opinion.diff.tooltip" />}
          id="diff-modal-tooltip"
          placement="top"
          className="in"
          style={{
            wordBreak: 'break-word',
          }}
        >
          <Button bsStyle="link" onClick={() => this.open()}>
            {link}
          </Button>
        </Tooltip>

        <Modal show={showModal} onHide={() => this.close()}>
          <Modal.Header closeButton>
            <Modal.Title>{modal.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <b>
              <FormattedMessage id="opinion.diff.title" />
            </b>
            <p className="small excerpt">
              <FormattedMessage id="opinion.diff.infos" />
            </p>
            <WYSIWYGRender className="diff" value={modal.diff} />
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="primary" onClick={() => this.close()}>
              <FormattedMessage id="global.close" />
            </Button>
          </Modal.Footer>
        </Modal>
      </span>
    )
  }
}

export default createFragmentContainer(OpinionBodyDiffModal, {
  modal: graphql`
    fragment OpinionBodyDiffModal_modal on OpinionModal {
      title
      diff
    }
  `,
})
