import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import FormMixin from '../../../utils/FormMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import FlashMessages from '../../Utils/FlashMessages';
import ArgumentActions from '../../../actions/ArgumentActions';
import ArgumentStore from '../../../stores/ArgumentStore';
import Input from '../../Form/Input';

const ArgumentForm = React.createClass({
  propTypes: {
    isSubmitting: PropTypes.bool.isRequired,
    onValidationFailure: PropTypes.func.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onSubmitFailure: PropTypes.func.isRequired,
    argument: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin, DeepLinkStateMixin, FormMixin],

  getInitialState() {
    const { argument } = this.props;
    return {
      form: {
        body: argument ? argument.body : '',
        confirm: false,
      },
      errors: {
        body: [],
        confirm: [],
      },
    };
  },

  componentWillReceiveProps(nextProps) {
    const {
      argument,
      onSubmitSuccess,
      onSubmitFailure,
      isSubmitting,
      onValidationFailure,
    } = this.props;
    if (nextProps.isSubmitting && !isSubmitting) {
      if (this.isValid()) {
        const opinion = ArgumentStore.opinion;
        const data = Object.assign({}, this.state.form);
        data.type = argument.type;
        delete data.confirm;

        return ArgumentActions.update(opinion, argument.id, data)
          .then(onSubmitSuccess)
          .catch(onSubmitFailure);
      }

      onValidationFailure();
    }
  },

  formValidationRules: {
    body: {
      notBlank: { message: 'argument.constraints.min' },
      min: { value: 3, message: 'argument.constraints.min' },
      max: { value: 2000, message: 'argument.constraints.max' },
    },
    confirm: {
      isTrue: { message: 'argument.constraints.confirm' },
    },
  },

  renderFormErrors(field) {
    return <FlashMessages errors={this.getErrorsMessages(field)} form />;
  },

  render() {
    return (
      <form id="argument-form" ref="form">
        <div className="alert alert-warning edit-confirm-alert">
          <Input
            type="checkbox"
            ref="check"
            id="argument-confirm"
            checkedLink={this.linkState('form.confirm')}
            children={this.getIntlMessage('argument.edit.confirm')}
            groupClassName={this.getGroupStyle('confirm')}
            errors={this.renderFormErrors('confirm')}
          />
        </div>
        <Input
          id="argument-body"
          type="textarea"
          rows={2}
          valueLink={this.linkState('form.body')}
          label={this.getIntlMessage('argument.edit.body')}
          groupClassName={this.getGroupStyle('body')}
          errors={this.renderFormErrors('body')}
        />
      </form>
    );
  },
});

export default ArgumentForm;
