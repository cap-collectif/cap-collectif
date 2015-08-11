import LoginStore from '../../stores/LoginStore';
import Validator from '../../services/Validator';
import OpinionActions from '../../actions/OpinionActions';
import LoginOverlay from '../Utils/LoginOverlay';

const Button = ReactBootstrap.Button;
const Input = ReactBootstrap.Input;

const OpinionArgumentForm = React.createClass({
  propTypes: {
    type: React.PropTypes.string,
  },
  mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin],

  getInitialState() {
    return {
      body: this.props.text,
      submitted: false,
      isSubmitting: false,
    };
  },

  componentDidUpdate() {
    autosize(React.findDOMNode(this.refs.body).querySelector('textarea'));
  },

  getStyle(field) {
    return !this.isValid(field) ? 'error' : this.state.submitted ? 'success' : '';
  },

  render() {
    return (
      <div className="opinion__body box">
        <div className="opinion__data">
          <form>
            <LoginOverlay children={
              <Input
                type='textarea'
                rows="2"
                ref="body"
                bsStyle={this.getStyle('title')}
                valueLink={this.linkState('body')}
                placeholder={this.getIntlMessage('argument.' + this.props.type + '.add')}
                label={this.getIntlMessage('argument.' + this.props.type + '.add')}
                labelClassName="sr-only"
              />
            } />
            {(LoginStore.isLoggedIn()
              ? <Button
                  disabled={this.state.isSubmitting}
                  onClick={!this.state.isSubmitting ? this.create.bind(this) : null}
                  bsStyle='primary'
                >
                  {this.state.isSubmitting
                    ? this.getIntlMessage('global.loading')
                    : this.getIntlMessage('global.publish')
                  }
                </Button>
              : <span />
            )}
          </form>
        </div>
      </div>
    );
  },

  create(e) {
    e.preventDefault();

    this.setState({ submitted: true}, () => {

      if (!this.isValid()) {
        return;
      }

      const data = {
        body: this.state.body,
        type: this.props.type === 'yes' ? 1 : 0,
      };

      OpinionActions
      .addVersionArgument(this.props.opinion.parent.id, this.props.opinion.id, data)
      .then(() => {
        this.setState(this.getInitialState());
        autosize.destroy(React.findDOMNode(this.refs.body));
        location.reload(); // TODO when enough time
        return true;
      })
      .catch(() => {
        this.setState({submitted: false});
      });

    });
  },

  isValid(field) {

    if (!this.state.submitted) {
      return true;
    }

    if (field === 'body') {
      return new Validator(this.state.body).min(2);
    }

    return this.isValid('body');
  },

});

export default OpinionArgumentForm;
