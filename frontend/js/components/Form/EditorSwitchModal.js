// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import Text from '~ui/Primitives/Text';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import Flex from '../Ui/Primitives/Layout/Flex';
import Heading from '~ui/Primitives/Heading';

type Props = {|
  +show: boolean,
  +setShow: boolean => void,
  +switchConfirm?: ?boolean,
  +setSwitchConfirm: () => void,
  +switchToNewEditor: () => void,
|};

const EditorSwitchModal = ({
  show,
  setShow,
  switchConfirm,
  setSwitchConfirm,
  switchToNewEditor,
}: Props) => {
  const intl = useIntl();
  return (
    <>
      <Button
        variant="tertiary"
        variantColor="primary"
        position="absolute"
        right={0}
        top="-30px"
        onClick={() => setShow(true)}>
        {intl.formatMessage({ id: 'activate-new-editor' })}
      </Button>
      {show && (
        <Modal
          mt="50px"
          zIndex={2000}
          hideCloseButton
          id="switch-editor-modal"
          ariaLabel="switch-editor-modal"
          show={show}>
          <>
            <Modal.Header>
              <Heading as="h4" color="blue.900">
                {intl.formatMessage({ id: 'are-you-sure-activating-new-editor' })}
              </Heading>
            </Modal.Header>
            <Modal.Body>
              <Text>{intl.formatMessage({ id: 'warning-activate-new-editor' })}</Text>
              <Text fontWeight={600} style={{ textDecoration: 'underline' }} mb={4}>
                {intl.formatMessage({ id: 'warning-action-irreversible' })}
              </Text>
              <Flex direction="row" spacing={2} alignItems="center">
                <input
                  id="isSwitchConfirmed"
                  name="isSwitchConfirmed"
                  checked={switchConfirm}
                  onChange={setSwitchConfirm}
                  type="checkbox"
                />
                <Text
                  as="label"
                  fontWeight={400}
                  marginBottom="0px !important"
                  style={{ cursor: 'pointer' }}
                  onClick={setSwitchConfirm}>
                  {intl.formatMessage({ id: 'admin.project.delete.confirm' })}
                </Text>
              </Flex>
            </Modal.Body>
            <Modal.Footer spacing={2}>
              <Button
                variantSize="big"
                variant="secondary"
                variantColor="hierarchy"
                onClick={() => setShow(false)}>
                {intl.formatMessage({ id: 'global.cancel' })}
              </Button>
              <Button
                variantSize="big"
                variant="primary"
                variantColor="primary"
                disabled={!switchConfirm}
                onClick={() => {
                  switchToNewEditor();
                  setShow(false);
                }}>
                {intl.formatMessage({ id: 'action_enable' })}
              </Button>
            </Modal.Footer>
          </>
        </Modal>
      )}
    </>
  );
};

export default EditorSwitchModal;
