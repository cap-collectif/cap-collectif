const MenuItem = ReactBootstrap.MenuItem;
const DropdownButton = ReactBootstrap.DropdownButton;

const ShareButtonDropdown = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    url: React.PropTypes.string.isRequired,
    className: React.PropTypes.string,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      className: '',
    };
  },

  render() {
    return (
      <DropdownButton
        className={this.props.className + ' dropdown--custom'}
        title={
          <span><i className="cap cap-link"></i> {this.getIntlMessage('global.share')}</span>
        }
      >
        <MenuItem eventKey="1" onClick={this.facebook.bind(null, this)}>
          <i className="cap cap-facebook"></i> {this.getIntlMessage('share.facebook')}
        </MenuItem>
        <MenuItem eventKey="2" onClick={this.twitter.bind(null, this)}>
          <i className="cap cap-twitter"></i> {this.getIntlMessage('share.twitter')}
        </MenuItem>
        <MenuItem eventKey="3" onClick={this.googleplus.bind(null, this)}>
          <i className="cap cap-gplus"></i> {this.getIntlMessage('share.googleplus')}
        </MenuItem>
        <MenuItem eventKey="4" href={`mailto:?subject=${this.props.title}&body=${this.props.url}`}>
          <i className="cap cap-mail-2-1"></i> {this.getIntlMessage('share.mail')}
        </MenuItem>
      </DropdownButton>
    );
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

});

export default ShareButtonDropdown;
