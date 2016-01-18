import LoginStore from '../../stores/LoginStore';
import FeatureStore from '../../stores/FeatureStore';
import LoginOverlay from '../Utils/LoginOverlay';

const Button = ReactBootstrap.Button;

const OpinionArgumentReportButton = React.createClass({
  propTypes: {
    argument: React.PropTypes.object.isRequired,
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
    if (this.props.argument.author === null || !LoginStore.isLoggedIn()) {
      return false;
    }
    return LoginStore.user.uniqueId === this.props.argument.author.uniqueId;
  },

  render() {
    if (this.state.reporting && !this.isTheUserTheAuthor()) {
      const reported = this.props.argument.has_user_reported;
      const argument = this.props.argument;
      return (
        <LoginOverlay>
          <Button
            aria-labelledby={'arg-' + argument.id}
            href={reported ? null : argument._links.report}
            bsSize="xsmall"
            active={reported}
            className="btn-dark-gray btn--outline"
          >
            <i className="cap cap-flag-1"></i>
            {reported ? this.getIntlMessage('global.report.reported') : this.getIntlMessage('global.report.submit')}
          </Button>
        </LoginOverlay>
      );
    }
    return null;
  },

});

export default OpinionArgumentReportButton;
