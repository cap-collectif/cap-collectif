// @flow
import * as React from 'react';
import Modal, { type ModalProps } from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import Button from '~ds/Button/Button';
import type { ButtonProps } from '~ds/Button/Button';
import useLoadingMachine from '~/utils/hooks/useLoadingMachine';
import { isAsync } from '~/utils/isAsync';

type Props = {|
  ...ModalProps,
  +options: {|
    +confirmButton: {|
      +content: string,
      +props?: ButtonProps,
    |},
    +cancelButton: {|
      +content: string,
      +props?: ButtonProps,
    |},
  |},
  +title: React$Node,
  +body?: React$Node,
  +onConfirm?: () => void | Promise<void>,
  +onCancel?: () => void | Promise<void>,
  +children?: React$Node,
|};

export const ConfirmModal = ({
  children,
  title,
  body,
  onConfirm,
  onCancel,
  options,
  ...props
}: Props) => {
  const { isLoading, startLoading, stopLoading } = useLoadingMachine();
  return (
    <Modal hideOnClickOutside={false} hideOnEsc={false} hideCloseButton {...props}>
      {({ hide }) => (
        <>
          <Modal.Header p={4}>
            <Heading>{title}</Heading>
          </Modal.Header>
          {body && <Modal.Body px={4}>{body}</Modal.Body>}
          <Modal.Footer
            spacing={4}
            p={4}
            align={['stretch', 'center']}
            direction={['column', 'row']}>
            <Button
              disabled={isLoading}
              isLoading={isLoading}
              justifyContent={['center', 'flex-start']}
              variant="primary"
              variantColor="danger"
              {...options.confirmButton.props}
              onClick={async () => {
                try {
                  if (onConfirm) {
                    if (isAsync(onConfirm)) {
                      startLoading();
                    }
                    await onConfirm();
                    stopLoading();
                  }
                  hide();
                } catch (e) {
                  stopLoading();
                  console.error(e);
                }
              }}>
              {options.confirmButton.content}
            </Button>
            <Button
              disabled={isLoading}
              variant="tertiary"
              justifyContent={['center', 'flex-start']}
              {...options.cancelButton.props}
              onClick={async () => {
                try {
                  if (onCancel) {
                    if (isAsync(onCancel)) {
                      startLoading();
                    }
                    await onCancel();
                    stopLoading();
                  }
                  hide();
                } catch (e) {
                  stopLoading();
                  console.error(e);
                }
              }}>
              {options.cancelButton.content}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default ConfirmModal;
