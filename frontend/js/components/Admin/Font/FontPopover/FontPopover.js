// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import FontPopoverContainer from './FontPopover.style';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import colors from '~/utils/colors';

type Props = {
  onClose?: () => void,
  onConfirm: () => void,
};

const FontPopover = ({ onClose, onConfirm }: Props) => (
  <FontPopoverContainer>
    <div className="body">
      <div className="header">
        <p className="title">
          <FormattedMessage id="confirmation-delete-custom-typeface" />
        </p>
        <button type="button" onClick={onClose} className="btn-close">
          <Icon name={ICON_NAME.close} size={10} color={colors.darkGray} />
        </button>
      </div>
      <p className="description">
        <FormattedMessage id="default-font-will-be-selected" />
      </p>
    </div>

    <div className="footer">
      <Button onClick={onClose} className="btn-cancel">
        <FormattedMessage id="global.cancel" />
      </Button>
      <Button
        onClick={() => {
          onConfirm();
          if (onClose) onClose();
        }}
        className="btn-confirm">
        <FormattedMessage id="global.delete" />
      </Button>
    </div>
  </FontPopoverContainer>
);

export default FontPopover;
