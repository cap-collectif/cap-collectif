import React from 'react';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';
import FormMixin from '../../../utils/FormMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import ProposalActions from '../../../actions/ProposalActions';
import FlashMessages from '../../Utils/FlashMessages';
import ArrayHelper from '../../../services/ArrayHelper';
import Input from '../../Form/Input';
import FeatureStore from '../../../stores/FeatureStore';

const ProposalForm = React.createClass({
  propTypes: {
    form: React.PropTypes.object.isRequired,
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
    isSubmitting: React.PropTypes.bool.isRequired,
    onValidationFailure: React.PropTypes.func,
    onSubmitSuccess: React.PropTypes.func,
    onSubmitFailure: React.PropTypes.func,
    mode: React.PropTypes.string,
    proposal: React.PropTypes.object,
  },
  mixins: [IntlMixin, DeepLinkStateMixin, FormMixin],

  getDefaultProps() {
    return {
      mode: 'create',
      proposal: {
        title: '',
        body: '',
        theme: {
          id: -1,
        },
        district: {
          id: -1,
        },
        responses: [],
      },
      onSubmitSuccess: () => {},
      onSubmitFailure: () => {},
      onValidationFailure: () => {},
    };
  },

  getInitialState() {
    return {
      form: {
        title: this.props.proposal.title,
        body: this.props.proposal.body,
        theme: this.props.proposal.theme.id,
        district: this.props.proposal.district.id,
      },
      custom: this.getInitialFormAnswers(),
      errors: {
        title: [],
        body: [],
        theme: [],
        district: [],
      },
      showThemes: FeatureStore.isActive('themes'),
      showDistricts: FeatureStore.isActive('districts'),
    };
  },

  componentWillMount() {
    FeatureStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.props.form.fields.map((field) => {
      const ref = 'custom-' + field.id;
      if (field.required) {
        this.formValidationRules[ref] = {
          notBlank: { message: 'proposal.constraints.field_mandatory' },
        };
      }
    });
    this.updateThemeConstraint();
    this.updateDistrictConstraint();
  },

  componentWillReceiveProps(nextProps) {
    if (!this.props.isSubmitting && nextProps.isSubmitting === true) {
      if (this.isValid()) {
        const form = this.state.form;
        const responses = [];
        const custom = this.state.custom;
        Object.keys(custom).map((key) => {
          const question = key.split('-')[1];
          responses.push({
            question: question,
            value: custom[key],
          });
        });
        form.responses = responses;
        if (!this.state.showThemes) {
          delete form.theme;
        }
        if (!this.state.showDistricts) {
          delete form.district;
        }
        if (this.props.mode === 'edit') {
          ProposalActions
            .update(this.props.form.id, this.props.proposal.id, form)
            .then(() => {
              this.setState(this.getInitialState());
              this.props.onSubmitSuccess();
            })
            .catch(() => {
              this.props.onSubmitFailure();
            });
          return;
        }
        ProposalActions
          .add(this.props.form.id, form)
          .then(() => {
            this.setState(this.getInitialState());
            this.props.onSubmitSuccess();
          })
          .catch(() => {
            this.props.onSubmitFailure();
          });
        return;
      }

      this.props.onValidationFailure();
    }
  },

  componentWillUnmount() {
    FeatureStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      showThemes: FeatureStore.isActive('themes'),
      showDistricts: FeatureStore.isActive('districts'),
    });
    this.updateThemeConstraint();
    this.updateDistrictConstraint();
  },

  getInitialFormAnswers() {
    const custom = {};
    this.props.form.fields.map((field) => {
      custom['custom-' + field.id] = this.getResponseForField(field.id);
    });
    return custom;
  },

  getResponseForField(id) {
    const index = ArrayHelper.getElementIndexFromArray(
      this.props.proposal.responses,
      { field: { id: id } },
      'field',
      'id'
    );
    if (index > -1) {
      return this.props.proposal.responses[index].value;
    }
    return '';
  },

  updateThemeConstraint() {
    if (this.state.showThemes) {
      this.formValidationRules.theme = {
        minValue: { value: 0, message: 'proposal.constraints.theme' },
      };
      return;
    }
    this.formValidationRules.theme = {};
  },

  updateDistrictConstraint() {
    if (this.state.showDistricts) {
      this.formValidationRules.district = {
        minValue: { value: 0, message: 'proposal.constraints.district' },
      };
      return;
    }
    this.formValidationRules.district = {};
  },

  formValidationRules: {
    title: {
      min: { value: 2, message: 'proposal.constraints.title' },
      notBlank: { message: 'proposal.constraints.title' },
    },
    body: {
      min: { value: 2, message: 'proposal.constraints.body' },
      notBlank: { message: 'proposal.constraints.body' },
    },
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
      <form id="proposal-form" ref="form">
        {
          this.props.form.description
          ? <FormattedHTMLMessage message={this.props.form.description} />
          : null
        }
        <Input
          id="proposal_title"
          type="text"
          ref="title"
          valueLink={this.linkState('form.title')}
          label={this.getIntlMessage('proposal.title') + ' *'}
          groupClassName={this.getGroupStyle('title')}
          errors={this.renderFormErrors('title')}
        />

        {
          this.state.showThemes
            ? <Input
              id="proposal_theme"
              type="select"
              ref="theme"
              valueLink={this.linkState('form.theme')}
              label={this.getIntlMessage('proposal.theme') + ' *'}
              groupClassName={this.getGroupStyle('theme')}
              errors={this.renderFormErrors('theme')}
              help={this.props.form.themeHelpText}
            >
              <option value={-1} disabled>{this.getIntlMessage('proposal.select.theme')}</option>
              {
                this.props.themes.map((theme) => {
                  return (
                    <option key={theme.id} value={theme.id}>
                      {theme.title}
                    </option>
                  );
                })
              }
            </Input>
            : null
        }

        {
          this.state.showDistricts
              ? <Input
                id="proposal_district"
                type="select"
                ref="district"
                valueLink={this.linkState('form.district')}
                label={this.getIntlMessage('proposal.district') + ' *'}
                groupClassName={this.getGroupStyle('district')}
                errors={this.renderFormErrors('district')}
                help={this.props.form.districtHelpText}
              >
                <option value={-1} disabled>{this.getIntlMessage('proposal.select.district')}</option>
                {
                  this.props.districts.map((district) => {
                    return (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                    );
                  })
                }
              </Input>
              : null
        }

      <Input
        id="proposal_body"
        type="editor"
        label={this.getIntlMessage('proposal.body') + ' *'}
        groupClassName={this.getGroupStyle('body')}
        errors={this.renderFormErrors('body')}
        valueLink={this.linkState('form.body')}
        help={this.props.form.descriptionHelpText}
      />

      {
        this.props.form.fields.map((field) => {
          const key = 'custom-' + field.id;
          const label = field.question + (field.required ? ' *' : '');
          return (
            <Input
              key={key}
              id={'proposal_' + key}
              type={field.type}
              label={label}
              groupClassName={this.getGroupStyle(key)}
              valueLink={this.linkState('custom.' + key)}
              help={field.helpText}
              errors={this.renderFormErrors(key)}
            />
          );
        })
      }

      </form>
    );
  },

});

export default ProposalForm;
