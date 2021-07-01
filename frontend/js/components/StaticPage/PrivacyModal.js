// @flow
import React from 'react';
import { useDisclosure } from '@liinkiing/react-hooks';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import CloseButton from '../Form/CloseButton';
import type { State } from '~/types';

type Props = {|
  +privacyContent: string,
  +title: string,
  +linkKeyword?: string,
  +onClick?: () => void,
|};

export const PrivacyModal = ({
  title = 'confidentialite.title',
  privacyContent,
  linkKeyword,
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const intl = useIntl();

  return (
    <div className="privacy-policy">
      <div>
        {linkKeyword && <FormattedMessage id={linkKeyword} />}&nbsp;
        <Button
          id="privacy-policy"
          className="p-0"
          variant="link"
          bsStyle="link"
          onClick={onOpen}
          name="privacy">
          <FormattedMessage id={title} />
        </Button>
      </div>
      <Modal
        animation={false}
        show={isOpen}
        onHide={onClose}
        bsSize="large"
        id="privacy-modal"
        className="privacy-policy"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header
          closeButton
          className="privacy-policy"
          closeLabel={intl.formatMessage({ id: 'close.modal' })}>
          <Modal.Title id="contained-modal-title-lg" className="privacy-policy">
            <FormattedMessage id="privacy-policy" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="content" dangerouslySetInnerHTML={{ __html: privacyContent }} />
        </Modal.Body>
        <Modal.Footer className="privacy-policy">
          <CloseButton buttonId="cookies-cancel" onClose={onClose} />
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state: State) => ({
  privacyContent: state.default.parameters['privacy-policy'],
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(PrivacyModal);
