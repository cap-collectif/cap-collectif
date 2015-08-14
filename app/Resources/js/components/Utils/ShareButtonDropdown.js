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
      className: "",
    }
  },

  facebook(height = 500, width = 700) {
    var top = (screen.height / 2) - (height / 2);
    var left = (screen.width / 2) - (width / 2);
    window.open(
      `http://www.facebook.com/sharer.php?u=${this.props.url}&t=${this.props.title}`,
      'sharer',
      `top=${top},left=${left},toolbar=0,status=0,width=${width},height=${height}`
    );
  },

  twitter(height = 500, width = 700) {
    window.open(
      `https://twitter.com/share?url=${this.props.url}&text=${this.props.title}`,
      'sharer',
      `toolbar=0, menubar=0, width=${width},height=${height}`
    );
  },

  googleplus(height = 600, width = 600) {
    window.open(
      `https://plus.google.com/share?url=${this.props.url}&title=${this.props.title}`,
      'sharer',
      `toolbar=0, menubar=0, width=${width},height=${height}`
    );
  },

  render() {
    return(
      <DropdownButton
        className={this.props.className + " dropdown--custom"}
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

});

export default ShareButtonDropdown;
