import React from 'react';
import ReactDOM from 'react-dom';
import { IntlMixin } from 'react-intl';
import { Button } from 'react-bootstrap';
import autosize from 'autosize';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import LoginStore from '../../../stores/LoginStore';
import LoginOverlay from '../../Utils/LoginOverlay';
import ValidatorMixin from '../../../utils/ValidatorMixin';
import FlashMessages from '../../Utils/FlashMessages';
import ArgumentActions from '../../../actions/ArgumentActions';
import Input from '../../Form/Input';

const ArgumentCreate = React.createClass({
  propTypes: {
    type: React.PropTypes.string.isRequired,
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin, DeepLinkStateMixin, ValidatorMixin],

  getInitialState() {
    return {
      body: '',
      isSubmitting: false,
      type: this.getNumericType(),
    };
  },

  componentDidMount() {
    this.initForm('form', {
      body: {
        notBlank: { message: 'argument.constraints.min' },
        min: { value: 3, message: 'argument.constraints.min' },
        max: { value: 2000, message: 'argument.constraints.max' },
      },
    });
  },

  componentDidUpdate() {
    autosize(ReactDOM.findDOMNode(this.refs.body).querySelector('textarea'));
  },

  getNumericType() {
    return this.props.type === 'no' ? 0 : 1;
  },

  create() {
    this.setState({ submitted: true }, () => {
      if (!this.isValid()) {
        return;
      }

      this.setState({ isSubmitting: true });

      const data = {
        body: this.state.body,
        type: this.props.type === 'yes' || this.props.type === 'simple' ? 1 : 0,
      };

      ArgumentActions
        .add(this.props.opinion, data)
        .then(() => {
          this.setState(this.getInitialState());
          autosize.destroy(ReactDOM.findDOMNode(this.refs.body));
          ArgumentActions.load(this.props.opinion, this.state.type);
          return true;
        })
        .catch(() => {
          this.setState({ isSubmitting: false, submitted: false });
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
    const disabled = !this.props.opinion.isContribuable;
    return (
      <div className="opinion__body box">
        <div className="opinion__data">
          <form id={'argument-form--' + this.props.type} ref="form">
            <LoginOverlay>
              <Input
                id={'arguments-body-' + this.props.type}
                type="textarea"
                rows="2"
                name="body"
                ref="body"
                valueLink={this.linkState('body')}
                label={this.getIntlMessage('argument.' + this.props.type + '.add')}
                placeholder={this.getIntlMessage('argument.' + this.props.type + '.add')}
                groupClassName={this.getGroupStyle('body')}
                labelClassName="sr-only"
                errors={this.renderFormErrors('body')}
                disabled={disabled}
              />
            </LoginOverlay>
            {LoginStore.isLoggedIn()
              ? <Button
                  disabled={this.state.isSubmitting || disabled}
                  onClick={this.state.isSubmitting || disabled ? null : this.create}
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

export default ArgumentCreate;
