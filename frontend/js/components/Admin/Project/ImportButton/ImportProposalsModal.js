// @flow
import * as React from 'react';
import { FormattedHTMLMessage, FormattedMessage, useIntl } from 'react-intl';
import { HelpBlock } from 'react-bootstrap';
import Flex from '~ui/Primitives/Layout/Flex';
import Modal from '~ds/Modal/Modal';
import FileUpload from '~/components/Form/FileUpload/FileUpload';
import Text from '~ui/Primitives/Text';
import colors from '~/utils/colors';
import Icon, { ICON_NAME as ICON } from '~ui/Icons/Icon';
import Button from '~ds/Button/Button';
import Heading from '~ui/Primitives/Heading';

type Props = {|
  show: boolean,
  selectedStepId: string,
  onClose: () => void,
|};

const ImportProposalsModal = ({ show, selectedStepId, onClose }: Props) => {
  const isFeatureReady = false;
  const intl = useIntl();
  return (
    <Modal
      hideCloseButton
      ariaLabel="contained-modal-title-lg"
      show={show}
      width={['100%', '555px']}>
      <Modal.Header paddingY={6} borderBottom={`1px solid ${colors.borderColor}`}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading>
            <FormattedMessage id="import-proposals" />
          </Heading>
          <Icon
            name={ICON.close}
            onClick={onClose}
            size={12}
            color={colors.darkGray}
            style={{ cursor: 'pointer' }}
          />
        </Flex>
      </Modal.Header>
      <Modal.Body>
        <HelpBlock className="no-margin">
          <Text lineHeight="24px">
            <FormattedHTMLMessage
              id="import-proposals-help-text"
              values={{
                url: `/export-step-proposal-form-csv-model/${selectedStepId}`,
              }}
            />
          </Text>
        </HelpBlock>
        {isFeatureReady && (
          <FileUpload
            id="csv-upload"
            typeForm="default"
            value={null}
            onChange={() => {
              // TODO mutation to test file
            }}
          />
        )}
      </Modal.Body>
      <Modal.Footer as="div" paddingY={6} borderTop={`1px solid ${colors.borderColor}`}>
        <Flex justify="space-between" align="baseline">
          <div>
            {isFeatureReady && (
              <Text color={colors.primaryColor}>
                <Icon name={ICON.information} color={colors.primaryColor} size={12} />
                <span className="ml-10">
                  <FormattedMessage className="ml-8" tagName="b" id="information" />
                </span>
              </Text>
            )}
          </div>
          <Flex flexDirection="row">
            <Button
              variant="tertiary"
              variantSize="big"
              variantColor="hierarchy"
              mr={8}
              onClick={onClose}>
              {intl.formatMessage({ id: 'global.back' })}
            </Button>
            <Button
              disabled={!isFeatureReady}
              variant="primary"
              variantColor="primary"
              variantSize="big">
              {intl.formatMessage({ id: 'global.next' })}
            </Button>
          </Flex>
        </Flex>
      </Modal.Footer>
    </Modal>
  );
};

export default ImportProposalsModal;
