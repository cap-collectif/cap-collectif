// @flow
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import ProposalContactModal from './ProposalContactModal';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import colors from '~/utils/colors';

export const ProposalContactButton = ({ proposalId }: { proposalId: string }) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <ProposalContactModal
        show={showModal}
        onClose={() => setShowModal(false)}
        proposalId={proposalId}
      />
      <Button
        id="ProposalContactModal-show-button"
        bsStyle="default"
        onClick={() => {
          setShowModal(true);
        }}>
        <Icon name={ICON_NAME.message} size={16} color={colors.darkText} />{' '}
        <FormattedMessage id="send-message" />
      </Button>
    </>
  );
};
