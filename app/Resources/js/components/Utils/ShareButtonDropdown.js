import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { MenuItem, DropdownButton, Modal } from 'react-bootstrap';

const ShareButtonDropdown = React.createClass({
  propTypes: {
    id: PropTypes.string,
    enabled: PropTypes.bool.isRequired,
    title: PropTypes.string,
    url: PropTypes.string.isRequired,
    className: PropTypes.string,
    bsStyle: PropTypes.string,
    style: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      id: 'share-button',
      className: '',
      title: '',
      style: {},
    };
  },

  getInitialState() {
    return {
      show: false,
    };
  },

  getEncodedUrl() {
    const { url } = this.props;
    return encodeURIComponent(url);
  },

  facebook() {
    const { title } = this.props;
    this.openSharer(
      `http://www.facebook.com/sharer.php?u=${this.getEncodedUrl()}&t=${title}`,
      'Facebook',
    );
  },

  twitter() {
    const { title } = this.props;
    this.openSharer(
      `https://twitter.com/share?url=${this.getEncodedUrl()}&text=${title}`,
      'Twitter',
    );
  },

  googleplus() {
    const { title } = this.props;
    this.openSharer(
      `https://plus.google.com/share?url=${this.getEncodedUrl()}&title=${title}`,
      'Google+',
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
      `top=${top},left=${left},menubar=0,toolbar=0,status=0,width=${width},height=${height}`,
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
    const {
      title,
      url,
    } = this.props;
    return (
      <Modal show={this.state.show} onHide={this.hideModal} animation={false} dialogClassName="modal--custom modal--share-link">
        <Modal.Header closeButton>
          <Modal.Title>{this.getIntlMessage('share.link')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="excerpt">{title}</p>
          <textarea title={this.getIntlMessage('share.link')} readOnly rows="3">
            {url}
          </textarea>
        </Modal.Body>
      </Modal>
    );
  },

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
          className={`${className} dropdown--custom`}
          style={style}
          title={
            <span><i className="cap cap-link"></i> {this.getIntlMessage('global.share')}</span>
          }
        >
          <MenuItem eventKey="1" onSelect={this.facebook}>
            <i className="cap cap-facebook"></i> {this.getIntlMessage('share.facebook')}
          </MenuItem>
          <MenuItem eventKey="2" onSelect={this.twitter}>
            <i className="cap cap-twitter"></i> {this.getIntlMessage('share.twitter')}
          </MenuItem>
          <MenuItem eventKey="3" onSelect={this.googleplus}>
            <i className="cap cap-gplus"></i> {this.getIntlMessage('share.googleplus')}
          </MenuItem>
          <MenuItem eventKey="4" href={`mailto:?subject=${title}&body=${url}`}>
            <i className="cap cap-mail-2-1"></i> {this.getIntlMessage('share.mail')}
          </MenuItem>
          <MenuItem eventKey="4" onSelect={this.showModal}>
            <i className="cap cap-link-1"></i> {this.getIntlMessage('share.link')}
          </MenuItem>
        </DropdownButton>
        {this.renderModal()}
      </div>
    );
  },

});

const mapStateToProps = state => ({
  enabled: state.default.features.share_buttons,
});

export default connect(mapStateToProps)(ShareButtonDropdown);
