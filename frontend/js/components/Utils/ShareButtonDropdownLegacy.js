// @flow
import * as React from 'react';
import { useDisclosure } from '@liinkiing/react-hooks';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';
import type { GlobalState } from '~/types';
import type { BsSize } from '~/types/ReactBootstrap.type';
import ShareButtonActionLegacy from '../Ui/Button/ShareButtonActionLegacy';
import Menu from '../DesignSystem/Menu/Menu';
import Button from '~ds/Button/Button';
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon';
import colors from '~/utils/colors';

type Props = {|
  id: string,
  enabled: boolean,
  title: string,
  url: string,
  className?: string,
  bsSize?: BsSize,
  outline?: boolean,
  grey?: boolean,
  disabled?: boolean,
|};

const ShareButtonDropdownLegacy = ({
  id = 'share-button',
  title = '',
  url,
  enabled,
  bsSize,
  disabled,
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const intl = useIntl();
  const getEncodedUrl = () => encodeURIComponent(url);
  const openSharer = (href: string, name: string) => {
    const height = 500;
    const width = 700;
    const top = window.screen.height / 2 - height / 2;
    const left = window.screen.width / 2 - width / 2;
    window.open(
      href,
      name,
      `top=${top},left=${left},menubar=0,toolbar=0,status=0,width=${width},height=${height}`,
    );
  };

  const mail = () => {
    window.open(`mailto:?subject=${title}&body=${url}`);
  };

  const facebook = () => {
    openSharer(`https://www.facebook.com/sharer.php?u=${getEncodedUrl()}&t=${title}`, 'Facebook');
  };

  const twitter = () => {
    openSharer(`https://twitter.com/share?url=${getEncodedUrl()}&text=${title}`, 'Twitter');
  };

  const linkedin = () => {
    openSharer(
      `https://www.linkedin.com/shareArticle?mini=true&url=${getEncodedUrl()}&text=${title}`,
      'Linkedin',
    );
  };

  const renderModal = () => {
    return (
      <Modal
        show={isOpen}
        onHide={onClose}
        animation={false}
        dialogClassName="modal--custom modal--share-link">
        <Modal.Header closeButton closeLabel={intl.formatMessage({ id: 'close.modal' })}>
          <Modal.Title>
            <FormattedMessage id="share.link" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="excerpt">{title}</p>
          <textarea title={<FormattedMessage id="share.link" />} readOnly rows="3">
            {url}
          </textarea>
        </Modal.Body>
      </Modal>
    );
  };

  return enabled ? (
    <Menu placement="bottom-start" className="share-button-dropdown">
      <Menu.Button>
        <Button
          style={{
            color: colors.black,
            backgroundColor: colors.white,
            padding: '0px 12px',
            fontWeight: 400,
          }}
          id={id}
          disabled={disabled}
          rightIcon={
            <Icon name={ICON_NAME.ARROW_DOWN_O} size={ICON_SIZE.SM} color={colors.black} />
          }
          leftIcon={
            <Icon name={ICON_NAME.SHARE} size={bsSize === 'xs' ? ICON_SIZE.XS : ICON_SIZE.SM} />
          }
          variant="tertiary"
          variantColor="hierarchy">
          {intl.formatMessage({ id: 'global.share' })}
        </Button>
      </Menu.Button>
      <Menu.List>
        <ShareButtonActionLegacy action="mail" onSelect={mail} />
        <ShareButtonActionLegacy action="facebook" onSelect={facebook} />
        <ShareButtonActionLegacy action="twitter" onSelect={twitter} />
        <ShareButtonActionLegacy action="linkedin" onSelect={linkedin} />
        <ShareButtonActionLegacy action="link" onSelect={onOpen} />
        {renderModal()}
      </Menu.List>
    </Menu>
  ) : null;
};

const mapStateToProps = (state: GlobalState) => ({
  enabled: state.default.features.share_buttons,
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(ShareButtonDropdownLegacy);
