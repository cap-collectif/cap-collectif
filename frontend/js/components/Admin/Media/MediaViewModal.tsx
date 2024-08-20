import * as React from 'react'

import styled from 'styled-components'
import { Modal } from 'react-bootstrap'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'
import Image from '~ui/Primitives/Image'

type Props = {
  show: boolean
  closeModal: () => void
  url: string | null | undefined
}
export const ViewModal = styled(Modal)`
  img {
    height: 100%;
    max-width: 100%;
    max-height: 350px;
    ${MAIN_BORDER_RADIUS}
  }

  button + div {
    padding: 15px 20px;
    text-align: center;
  }

  button {
    position: absolute;
    right: 10px;
    top: 10px;
    border: none;
    background: none;
    outline: none;
    padding: 0;
  }
`
export const MediaViewModal = ({ show, closeModal, url }: Props) => (
  <ViewModal
    animation={false}
    show={show}
    dialogClassName="custom-modal-dialog"
    onHide={closeModal}
    bsSize="medium"
    aria-labelledby="contained-modal-title-lg"
  >
    <Modal.Body>
      <button type="button" onClick={closeModal}>
        <Icon name={ICON_NAME.close} size={15} />
      </button>
      <div>
        <Image src={url || ''} alt="displayed media" />
      </div>
    </Modal.Body>
  </ViewModal>
)
export default MediaViewModal
