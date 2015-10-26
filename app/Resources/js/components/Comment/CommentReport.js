import FeatureStore from '../../stores/FeatureStore';
import LoginStore from '../../stores/LoginStore';

const CommentReport = React.createClass({
  propTypes: {
    comment: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      reporting: FeatureStore.isActive('reporting'),
    };
  },

  componentWillMount() {
    FeatureStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    FeatureStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      reporting: FeatureStore.isActive('reporting'),
    });
  },

  isTheUserTheAuthor() {
    if (this.props.comment.author === null || !LoginStore.isLoggedIn()) {
      return false;
    }
    return LoginStore.user.uniqueId === this.props.comment.author.uniqueId;
  },

  render() {
    if (this.state.reporting && !this.isTheUserTheAuthor()) {
      if (this.props.comment.has_user_reported) {
        return (
          <button disabled="disabled" className="btn btn-xs btn-dark-gray">
            <i className="cap cap-flag-1"></i>
            { ' ' }
            { this.getIntlMessage('comment.report.reported') }
          </button>
        );
      }

      return (
        <a href={this.props.comment._links.report} className="btn btn-xs btn-dark-gray btn--outline">
          <i className="cap cap-flag-1"></i>
          { ' ' }
          { this.getIntlMessage('comment.report.submit') }
        </a>
      );
    }
    return null;
  },

});

export default CommentReport;
