import * as React from 'react'

import styled from 'styled-components'
import { Modal } from 'react-bootstrap'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import FileUpload from '~/components/Form/FileUpload/FileUpload'

type Props = {
  show: boolean
  closeModal: () => void
}
const UploadModal = styled(Modal)`
  button + div {
    padding: 15px 20px;
  }

  > div > div > div > button {
    position: absolute;
    right: 10px;
    top: 10px;
    border: none;
    background: none;
    outline: none;
    padding: 0;
  }
`
export const MediaUploadModal = ({ show, closeModal }: Props) => (
  <UploadModal
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
        <FileUpload
          id="media-upload"
          onChange={values => {
            if (values?.length) window.location.reload()
          }}
          typeForm="default"
          value={null}
        />
      </div>
    </Modal.Body>
  </UploadModal>
)
export default MediaUploadModal
