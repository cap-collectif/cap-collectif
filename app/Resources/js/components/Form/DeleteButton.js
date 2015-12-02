import LoginStore from '../../stores/LoginStore';

const DeleteButton = React.createClass({
  propTypes: {
    author: React.PropTypes.object,
    onClick: React.PropTypes.func.isRequired,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      author: null,
      className: '',
      style: null,
    };
  },

  isDeletable() {
    return this.isTheUserTheAuthor();
  },

  isTheUserTheAuthor() {
    if (this.props.author === null || !LoginStore.isLoggedIn()) {
      return false;
    }
    return LoginStore.user.uniqueId === this.props.author.uniqueId;
  },

  render() {
    if (this.isDeletable()) {
      const classes = {
        'btn': true,
        'btn-danger': true,
        'btn--outline': true,
      };
      classes[this.props.className] = true;

      return (
        <button
          style={this.props.style} className={classNames(classes)}
          onClick={() => this.props.onClick()}
        >
            <i className="cap cap-bin-2"></i>
          { ' ' + this.getIntlMessage('global.remove')}
          </button>
      );
    }
    return null;
  },

});

export default DeleteButton;
