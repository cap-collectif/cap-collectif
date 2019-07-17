// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Modal } from 'react-bootstrap';
import { boolean, text, select } from '@storybook/addon-knobs';

const bsSizeOptions = {
  large: 'large',
  small: 'small',
  Null: 'null',
};

storiesOf('Layout|Modal', module).add(
  'default',
  () => {
    const bsSize = select('BsSize', bsSizeOptions, 'small');
    const closeButton = boolean('Close button', true);
    const closeLabel = text('Close label', 'Label');
    const content = text('Content', 'Content');
    const footer = text('Footer', 'Footer');
    const title = text('Title', 'Title');
    const showModal = boolean('Show modal', false);

    Modal.Dialog.displayName = 'Modal.Dialog';
    Modal.Header.displayName = 'Modal.Header';
    Modal.Title.displayName = 'Modal.Title';
    Modal.Body.displayName = 'Modal.Body';
    Modal.Footer.displayName = 'Modal.Footer';

    return (
      <Modal show={showModal} bsSize={bsSize}>
        <Modal.Header closeButton={closeButton} closeLabel={closeLabel}>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{content}</Modal.Body>
        <Modal.Footer>{footer}</Modal.Footer>
      </Modal>
    );
  },
  {
    info: {
      text: `
          Ce composant est utilisé ...
        `,
    },
  },
);
