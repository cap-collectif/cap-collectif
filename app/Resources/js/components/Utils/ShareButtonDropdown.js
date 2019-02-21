// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { MenuItem, DropdownButton, Modal } from 'react-bootstrap';
import type { GlobalState } from '../../types';

type Props = {|
  id: string,
  enabled: boolean,
  title: string,
  url: string,
  className?: string,
  bsStyle?: string,
  style?: Object,
|};

type State = {|
  show: boolean,
|};

class ShareButtonDropdown extends React.Component<Props, State> {
  static defaultProps = {
    id: 'share-button',
    className: '',
    title: '',
    style: {},
  };

  state = {
    show: false,
  };

  getEncodedUrl = () => {
    const { url } = this.props;
    return encodeURIComponent(url);
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
    const { enabled, style, id, bsStyle, className, title, url } = this.props;
    if (!enabled) {
      return null;
    }
    return (
      <div className="share-button-dropdown">
        <DropdownButton
          id={id}
          bsStyle={bsStyle}
          className={`${className || ''} dropdown--custom`}
          style={style}
          title={
            <span>
              <i className="cap cap-link" /> {<FormattedMessage id="global.share" />}
            </span>
          }>
          <MenuItem eventKey="1" href={`mailto:?subject=${title}&body=${url}`}>
            <i className="cap cap-mail-2-1" /> {<FormattedMessage id="share.mail" />}
          </MenuItem>
          <MenuItem eventKey="2" onSelect={this.facebook}>
            <i className="cap cap-facebook" /> {<FormattedMessage id="share.facebook" />}
          </MenuItem>
          <MenuItem eventKey="3" onSelect={this.twitter}>
            <i className="cap cap-twitter" /> {<FormattedMessage id="share.twitter" />}
          </MenuItem>
          <MenuItem eventKey="4" onSelect={this.linkedin}>
            <i className="cap cap-linkedin" /> {<FormattedMessage id="share.linkedin" />}
          </MenuItem>
          <MenuItem eventKey="5" onSelect={this.showModal}>
            <i className="cap cap-link-1" /> {<FormattedMessage id="share.link" />}
          </MenuItem>
        </DropdownButton>
        {this.renderModal()}
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  enabled: state.default.features.share_buttons,
});

export default connect(mapStateToProps)(ShareButtonDropdown);
