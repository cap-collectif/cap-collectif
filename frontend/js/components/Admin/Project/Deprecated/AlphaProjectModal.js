// @flow
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import { Label } from '~/components/Ui/Labels/Label';
import { baseUrl } from '~/config';

type Props = {|
  show: boolean,
  onClose: () => void,
  hasAnalysis: boolean,
  id: string,
|};

const ModalWrapper: StyledComponent<{}, {}, typeof Modal> = styled(Modal)`
  .modal-header {
    border-bottom: none !important;
  }

  span[class*='Label'] {
    padding: 1px 8px !important;
  }
`;

const Body: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  span:first-child {
    display: block;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 10px;
  }
`;

const Pictures: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  text-align: center;
  justify-content: center;
  margin-top: 20px;

  div {
    margin: 0 10px;
  }

  p {
    margin-top: 10px;
    font-weight: bold;
  }

  img {
    max-height: 160px;
    max-width: 240px;
    width: 100%;
    border: 1px solid #ddd;
  }
`;

const imagesPath = `${baseUrl}/screenshots`;

export const AlphaProjectModal = ({ id, show, onClose, hasAnalysis = false }: Props) => (
  <ModalWrapper
    bsSize="large"
    show={show}
    onHide={onClose}
    aria-labelledby="alpha-modal-project-lg">
    <Modal.Header closeButton>
      <Label color="#007bff" fontSize={12}>
        <FormattedMessage id="global.new" />
      </Label>
    </Modal.Header>
    <Modal.Body>
      <Body>
        <FormattedMessage id="title.discover.new.project.page" />
        <FormattedMessage id="description.new.project.page" />
      </Body>
      <Pictures>
        <div>
          <img src={`${imagesPath}/configuration.png`} alt="Configuration de Projet" />
          <FormattedMessage tagName="p" id="caption.project.setup" />
        </div>
        <div>
          <img src={`${imagesPath}/participants.png`} alt="Gestion des participants" />
          <FormattedMessage tagName="p" id="caption.manage.participants" />
        </div>
        {hasAnalysis && (
          <div>
            <img src={`${imagesPath}/planification.png`} alt="Gestion des participants" />
            <FormattedMessage tagName="p" id="caption.manage.analysis" />
          </div>
        )}
      </Pictures>
    </Modal.Body>
    <Modal.Footer>
      <Button
        bsStyle="primary"
        onClick={() => {
          window.location.href = `/admin/alpha/project/${id}/edit`;
        }}>
        <FormattedMessage id="global.discover" />
      </Button>
    </Modal.Footer>
  </ModalWrapper>
);

export default AlphaProjectModal;
