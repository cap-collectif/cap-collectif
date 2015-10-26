import LoginStore from '../../stores/LoginStore';
import FeatureStore from '../../stores/FeatureStore';
import LoginOverlay from '../Utils/LoginOverlay';

const Button = ReactBootstrap.Button;

const OpinionSourceReportButton = React.createClass({
  propTypes: {
    source: React.PropTypes.object.isRequired,
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
    if (this.props.source.author === null || !LoginStore.isLoggedIn()) {
      return false;
    }
    return LoginStore.user.uniqueId === this.props.source.author.uniqueId;
  },

  render() {
    if (!this.isTheUserTheAuthor() && this.state.reporting) {
      const source = this.props.source;
      if (source.has_user_reported) {
        return (
          <LoginOverlay>
            <Button bsSize="xsmall" className="source__btn--report btn-dark-gray active">
              <i className="cap cap-flag-1"></i>
              {this.getIntlMessage('global.report.reported')}
            </Button>
          </LoginOverlay>
        );
      }
      return (
        <LoginOverlay>
          <Button href={source._links.report} bsSize="xsmall" className="source__btn--report btn-dark-gray btn--outline">
            <i className="cap cap-flag-1"></i>
            {this.getIntlMessage('global.report.submit')}
          </Button>
        </LoginOverlay>
      );
    }
    return null;
  },

});

export default OpinionSourceReportButton;
