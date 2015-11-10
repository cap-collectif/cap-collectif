import LoginStore from '../../../stores/LoginStore';

const ProposalEditButton = React.createClass({
  propTypes: {
    author: React.PropTypes.object,
    onClick: React.PropTypes.func.isRequired,
    hasWrapper: React.PropTypes.bool,
    wrapperClassName: React.PropTypes.string,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      author: null,
      hasWrapper: false,
      wrapperClassName: '',
    };
  },

  isTheUserTheAuthor() {
    if (this.props.author === null || !LoginStore.isLoggedIn()) {
      return false;
    }
    return LoginStore.user.uniqueId === this.props.author.uniqueId;
  },

  renderButton() {
    return (
      <span className="btn btn-dark-gray btn--outline" onClick={() => this.props.onClick()}>
          <i className="cap cap-pencil-1"></i>
        { ' ' + this.getIntlMessage('global.edit')}
        </span>
    );
  },

  render() {
    if (this.isTheUserTheAuthor()) {
      return this.props.hasWrapper
        ? <span className={this.props.wrapperClassName} >
            {this.renderButton()}
          </span>
        : this.renderButton()
      ;
    }
    return null;
  },

});

export default ProposalEditButton;
