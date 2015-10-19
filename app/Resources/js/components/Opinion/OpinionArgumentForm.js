import LoginStore from '../../stores/LoginStore';
import OpinionActions from '../../actions/OpinionActions';
import LoginOverlay from '../Utils/LoginOverlay';
import ValidatorMixin from '../../utils/ValidatorMixin';
import FlashMessages from '../Utils/FlashMessages';

const Button = ReactBootstrap.Button;
const Input = ReactBootstrap.Input;

const OpinionArgumentForm = React.createClass({
  propTypes: {
    type: React.PropTypes.string.isRequired,
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin, ValidatorMixin],

  getInitialState() {
    return {
      body: '',
      isSubmitting: false,
    };
  },

  componentDidMount() {
    this.initForm('form', {
      body: {
        notBlank: {message: 'argument.constraints.min'},
        min: {value: 3, message: 'argument.constraints.min'},
        max: {value: 2000, message: 'argument.constraints.max'},
      },
    });
  },

  componentDidUpdate() {
    autosize(React.findDOMNode(this.refs.body).querySelector('textarea'));
  },

  create() {
    this.setState({submitted: true}, () => {
      if (!this.isValid()) {
        return;
      }

      this.setState({isSubmitting: true});

      const data = {
        body: this.state.body,
        type: this.props.type === 'yes' || this.props.type === 'simple' ? 1 : 0,
      };

      OpinionActions
        .addArgument(this.props.opinion, data)
        .then(() => {
          this.setState(this.getInitialState());
          autosize.destroy(React.findDOMNode(this.refs.body));
          return true;
        })
        .catch(() => {
          this.setState({isSubmitting: false, submitted: false});
        });
    });
  },

  isVersion() {
    return !!this.props.opinion.parent;
  },

  renderFormErrors(field) {
    const errors = this.getErrorsMessages(field);
    if (errors.length > 0) {
      return <FlashMessages errors={errors} form />;
    }
    return null;
  },

  render() {
    return (
      <div className="opinion__body box">
        <div className="opinion__data">
          <form id={'argument-form--' + this.props.type} ref="form">
            <LoginOverlay children={
              <div className={'form-group ' + this.getGroupStyle('body')}>
                <label htmlFor={'arguments-body-' + this.props.type} className="control-label h5 sr-only">
                  {this.getIntlMessage('argument.' + this.props.type + '.add')}
                </label>
                <Input
                  id={'arguments-body-' + this.props.type}
                  type="textarea"
                  rows="2"
                  name="body"
                  ref="body"
                  bsStyle={this.getFieldStyle('body')}
                  valueLink={this.linkState('body')}
                  placeholder={this.getIntlMessage('argument.' + this.props.type + '.add')}
                />
                {this.renderFormErrors('body')}
              </div>
            } />
            {LoginStore.isLoggedIn()
              ? <Button
                  disabled={this.state.isSubmitting}
                  onClick={this.state.isSubmitting ? null : this.create.bind(null, this)}
                  bsStyle="primary"
                >
                  {this.state.isSubmitting
                    ? this.getIntlMessage('global.loading')
                    : this.getIntlMessage('global.publish')
                  }
                </Button>
              : null
            }
          </form>
        </div>
      </div>
    );
  },

});

export default OpinionArgumentForm;
