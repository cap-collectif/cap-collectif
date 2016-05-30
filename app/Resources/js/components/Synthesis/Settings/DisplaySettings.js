import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import Input from '../../Form/Input';
import SynthesisActions from '../../../actions/SynthesisActions';
import { Button } from 'react-bootstrap';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import FormMixin from '../../../utils/FormMixin';
import FlashMessages from '../../Utils/FlashMessages';

const DisplaySettings = React.createClass({
  propTypes: {
    synthesis: PropTypes.object,
  },
  mixins: [IntlMixin, DeepLinkStateMixin, FormMixin],

  getInitialState() {
    return {
      isSaving: false,
      form: this.props.synthesis.displayRules || {
        level: 1,
      },
      errors: {
        level: [],
      },
    };
  },

  formValidationRules: {
    level: {
      minValue: { value: 0, message: 'synthesis.settings.display.level_constraints' },
      maxValue: { value: 5, message: 'synthesis.settings.display.level_constraints' },
    },
  },

  updateSettings() {
    if (this.isValid()) {
      this.setState({
        isSaving: true,
      });
      SynthesisActions.updateDisplaySettings(
        this.props.synthesis.id,
        { rules: this.state.form }
      ).then(() => {
        SynthesisActions.load(this.props.synthesis.id);
        this.setState({
          isSaving: false,
        });
      });
    }
    return false;
  },

  renderFormErrors(field) {
    const errors = this.getErrorsMessages(field);
    if (errors.length === 0) {
      return null;
    }
    return <FlashMessages errors={errors} form />;
  },

  render() {
    return (
      <div className="display-settings">
        <form>
          <Input
            type="number"
            label={this.getIntlMessage('synthesis.settings.display.level')}
            valueLink={this.linkState('form.level')}
            min="1"
            max="5"
            groupClassName={this.getGroupStyle('level')}
            errors={this.renderFormErrors('level')}
            help={this.getIntlMessage('synthesis.settings.display.level_help')}
          />
          <Button type="button" onClick={() => this.updateSettings()}>
            {
              this.state.isSaving
                ? this.getIntlMessage('global.loading')
                : this.getIntlMessage('global.save')
            }
          </Button>
        </form>
      </div>
    );
  },

});

export default DisplaySettings;
