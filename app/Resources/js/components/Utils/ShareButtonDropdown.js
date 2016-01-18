const MenuItem = ReactBootstrap.MenuItem;
const DropdownButton = ReactBootstrap.DropdownButton;
const Modal = ReactBootstrap.Modal;

const ShareButtonDropdown = React.createClass({
  propTypes: {
    title: React.PropTypes.string,
    url: React.PropTypes.string.isRequired,
    className: React.PropTypes.string,
    bsStyle: React.PropTypes.string,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      className: '',
      title: '',
    };
  },

  getInitialState() {
    return {
      show: false,
    };
  },

  facebook() {
    this.openSharer(
      `http://www.facebook.com/sharer.php?u=${this.props.url}&t=${this.props.title}`,
      'Facebook'
    );
  },

  twitter() {
    this.openSharer(
      `https://twitter.com/share?url=${this.props.url}&text=${this.props.title}`,
      'Twitter'
    );
  },

  googleplus() {
    this.openSharer(
      `https://plus.google.com/share?url=${this.props.url}&title=${this.props.title}`,
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
      <Modal show={this.state.show} onHide={this.hideModal} animation={false} dialogClassName="modal--custom">
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
      <DropdownButton
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
        {this.renderModal()}
      </DropdownButton>
    );
  },

});

export default ShareButtonDropdown;
