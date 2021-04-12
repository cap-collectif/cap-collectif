// @flow
import * as React from 'react';
import { useDisclosure } from '@liinkiing/react-hooks';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';
import type { GlobalState } from '~/types';
import type { BsSize } from '~/types/ReactBootstrap.type';
import ShareButton from '../Ui/Button/ShareButton';
import ShareButtonAction from '../Ui/Button/ShareButtonAction';

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

const ShareButtonDropdown = ({
  id = 'share-button',
  title = '',
  className = '',
  url,
  enabled,
  bsSize,
  outline,
  grey,
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
    openSharer(`http://www.facebook.com/sharer.php?u=${getEncodedUrl()}&t=${title}`, 'Facebook');
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
    <ShareButton
      id={id}
      bsSize={bsSize}
      className={className}
      outline={outline}
      grey={grey}
      disabled={disabled}>
      <ShareButtonAction action="mail" onSelect={mail} />
      <ShareButtonAction action="facebook" onSelect={facebook} />
      <ShareButtonAction action="twitter" onSelect={twitter} />
      <ShareButtonAction action="linkedin" onSelect={linkedin} />
      <ShareButtonAction action="link" onSelect={onOpen} />
      {renderModal()}
    </ShareButton>
  ) : null;
};

const mapStateToProps = (state: GlobalState) => ({
  enabled: state.default.features.share_buttons,
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(ShareButtonDropdown);
