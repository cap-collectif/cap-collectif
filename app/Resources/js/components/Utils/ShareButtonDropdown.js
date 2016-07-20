import React from 'react';
import { IntlMixin } from 'react-intl';
import { MenuItem, DropdownButton, Modal } from 'react-bootstrap';

const ShareButtonDropdown = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    title: React.PropTypes.string,
    url: React.PropTypes.string.isRequired,
    className: React.PropTypes.string,
    bsStyle: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      id: 'share-button',
      className: '',
      title: '',
    };
  },

  getInitialState() {
    return {
      show: false,
    };
  },

  getEncodedUrl() {
    return encodeURIComponent(this.props.url);
  },

  facebook() {
    this.openSharer(
      `http://www.facebook.com/sharer.php?u=${this.getEncodedUrl()}&t=${this.props.title}`,
      'Facebook'
    );
  },

  twitter() {
    this.openSharer(
      `https://twitter.com/share?url=${this.getEncodedUrl()}&text=${this.props.title}`,
      'Twitter'
    );
  },

  googleplus() {
    this.openSharer(
      `https://plus.google.com/share?url=${this.getEncodedUrl()}&title=${this.props.title}`,
      'Google+'
    );
  },

  openSharer(href, name) {
    const height = 500;
    const width = 700;
    const top = (screen.height / 2) - (height / 2);
    const left = (screen.width / 2) - (width / 2);
    window.open(
      href,
      name,
      `top=${top},left=${left},menubar=0,toolbar=0,status=0,width=${width},height=${height}`
    );
  },

  showModal() {
    this.setState({
      show: true,
    });
  },

  hideModal() {
    this.setState({
      show: false,
    });
  },

  renderModal() {
    return (
      <Modal show={this.state.show} onHide={this.hideModal} animation={false} dialogClassName="modal--custom modal--share-link">
        <Modal.Header closeButton>
          <Modal.Title>{this.getIntlMessage('share.link')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="excerpt">{this.props.title}</p>
          <textarea title={this.getIntlMessage('share.link')} readOnly rows="3">
            {this.props.url}
          </textarea>
        </Modal.Body>
      </Modal>
    );
  },

  render() {
    return (
      <div className="share-button-dropdown">
        <DropdownButton
          id={this.props.id}
          bsStyle={this.props.bsStyle}
          className={this.props.className + ' dropdown--custom'}
          title={
            <span><i className="cap cap-link"></i> {this.getIntlMessage('global.share')}</span>
          }
        >
          <MenuItem eventKey="1" onSelect={this.facebook.bind(null, this)}>
            <i className="cap cap-facebook"></i> {this.getIntlMessage('share.facebook')}
          </MenuItem>
          <MenuItem eventKey="2" onSelect={this.twitter.bind(null, this)}>
            <i className="cap cap-twitter"></i> {this.getIntlMessage('share.twitter')}
          </MenuItem>
          <MenuItem eventKey="3" onSelect={this.googleplus.bind(null, this)}>
            <i className="cap cap-gplus"></i> {this.getIntlMessage('share.googleplus')}
          </MenuItem>
          <MenuItem eventKey="4" href={`mailto:?subject=${this.props.title}&body=${this.props.url}`}>
            <i className="cap cap-mail-2-1"></i> {this.getIntlMessage('share.mail')}
          </MenuItem>
          <MenuItem eventKey="4" onSelect={this.showModal.bind(null, this)}>
            <i className="cap cap-link-1"></i> {this.getIntlMessage('share.link')}
          </MenuItem>
        </DropdownButton>
        {this.renderModal()}
      </div>
    );
  },

});

export default ShareButtonDropdown;
