// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';
import type { GlobalState } from '../../types';
import ShareButton from '../Ui/Button/ShareButton';
import ShareButtonAction from '../Ui/Button/ShareButtonAction';

type Props = {|
  id: string,
  enabled: boolean,
  title: string,
  url: string,
  className?: string,
  bsSize?: string,
  outline?: boolean,
  grey?: boolean,
|};

type State = {|
  show: boolean,
|};

class ShareButtonDropdown extends React.Component<Props, State> {
  static defaultProps = {
    id: 'share-button',
    className: '',
    title: '',
  };

  state = {
    show: false,
  };

  getEncodedUrl = () => {
    const { url } = this.props;
    return encodeURIComponent(url);
  };

  mail = () => {
    const { title, url } = this.props;
    window.open(`mailto:?subject=${title}&body=${url}`);
  };

  facebook = () => {
    const { title } = this.props;
    this.openSharer(
      `http://www.facebook.com/sharer.php?u=${this.getEncodedUrl()}&t=${title}`,
      'Facebook',
    );
  };

  twitter = () => {
    const { title } = this.props;
    this.openSharer(
      `https://twitter.com/share?url=${this.getEncodedUrl()}&text=${title}`,
      'Twitter',
    );
  };

  linkedin = () => {
    const { title } = this.props;
    this.openSharer(
      `https://www.linkedin.com/shareArticle?mini=true&url=${this.getEncodedUrl()}&text=${title}`,
      'Linkedin',
    );
  };

  openSharer = (href: string, name: string) => {
    const height = 500;
    const width = 700;
    const top = screen.height / 2 - height / 2;
    const left = screen.width / 2 - width / 2;
    window.open(
      href,
      name,
      `top=${top},left=${left},menubar=0,toolbar=0,status=0,width=${width},height=${height}`,
    );
  };

  showModal = () => {
    this.setState({
      show: true,
    });
  };

  hideModal = () => {
    this.setState({
      show: false,
    });
  };

  renderModal = () => {
    const { title, url } = this.props;
    return (
      <Modal
        show={this.state.show}
        onHide={this.hideModal}
        animation={false}
        dialogClassName="modal--custom modal--share-link">
        <Modal.Header closeButton>
          <Modal.Title>{<FormattedMessage id="share.link" />}</Modal.Title>
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

  render() {
    const { enabled, id, className, bsSize, outline, grey } = this.props;
    if (!enabled) {
      return null;
    }
    return (
      <ShareButton id={id} bsSize={bsSize} className={className} outline={outline} grey={grey}>
        <ShareButtonAction action="mail" onSelect={this.mail} />
        <ShareButtonAction action="facebook" onSelect={this.facebook} />
        <ShareButtonAction action="twitter" onSelect={this.twitter} />
        <ShareButtonAction action="linkedin" onSelect={this.linkedin} />
        <ShareButtonAction action="link" onSelect={this.showModal} />
        {this.renderModal()}
      </ShareButton>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  enabled: state.default.features.share_buttons,
});

export default connect(mapStateToProps)(ShareButtonDropdown);
