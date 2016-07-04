import React, { PropTypes } from 'react';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';
import FormMixin from '../../../utils/FormMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import ProposalActions from '../../../actions/ProposalActions';
import FlashMessages from '../../Utils/FlashMessages';
import ArrayHelper from '../../../services/ArrayHelper';
import Input from '../../Form/Input';
import { connect } from 'react-redux';

const ProposalForm = React.createClass({
  propTypes: {
    form: PropTypes.object.isRequired,
    themes: PropTypes.array.isRequired,
    districts: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    onValidationFailure: PropTypes.func,
    onSubmitSuccess: PropTypes.func,
    onSubmitFailure: PropTypes.func,
    mode: PropTypes.string,
    proposal: PropTypes.object,
    features: PropTypes.object.isRequired,
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
        category: {
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
        category: this.props.proposal.category.id,
      },
      custom: this.getInitialFormAnswers(),
      errors: {
        title: [],
        body: [],
        theme: [],
        district: [],
        category: [],
      },
    };
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
    this.updateCategoryConstraint();
  },

  componentWillReceiveProps(nextProps) {
    this.updateThemeConstraint();
    this.updateDistrictConstraint();
    this.updateCategoryConstraint();
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
        if (!this.props.features.themes || !this.props.form.usingThemes) {
          delete form.theme;
        }
        if (!this.props.features.districts) {
          delete form.district;
        }
        if (this.props.categories.length === 0 || !this.props.form.usingCategories) {
          delete form.category;
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
    if (this.props.features.themes && this.props.form.usingThemes && this.props.form.themeMandatory) {
      this.formValidationRules.theme = {
        minValue: { value: 0, message: 'proposal.constraints.theme' },
      };
      return;
    }
    this.formValidationRules.theme = {};
  },

  updateDistrictConstraint() {
    if (this.props.features.districts) {
      this.formValidationRules.district = {
        minValue: { value: 0, message: 'proposal.constraints.district' },
      };
      return;
    }
    this.formValidationRules.district = {};
  },

  updateCategoryConstraint() {
    if (this.props.categories.length && this.props.form.usingCategories && this.props.form.categoryMandatory) {
      this.formValidationRules.category = {
        minValue: { value: 0, message: 'proposal.constraints.category' },
      };
      return;
    }
    this.formValidationRules.category = {};
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
    const { form, features, themes, districts, categories } = this.props;
    const optional = <span className="excerpt">{' ' + this.getIntlMessage('global.form.optional')}</span>;
    const themeLabel = (
      <span>
        {this.getIntlMessage('proposal.theme')}
        {!form.themeMandatory && optional}
      </span>
    );
    const categoryLabel = (
      <span>
        {this.getIntlMessage('proposal.category')}
        {!form.categoryMandatory && optional}
      </span>
    );
    return (
      <form id="proposal-form">
        {
          this.props.form.description
          ? <FormattedHTMLMessage message={form.description} />
          : null
        }
        <Input
          id="proposal_title"
          type="text"
          valueLink={this.linkState('form.title')}
          label={this.getIntlMessage('proposal.title')}
          groupClassName={this.getGroupStyle('title')}
          errors={this.renderFormErrors('title')}
        />

        {
          features.themes && form.usingThemes
            ? <Input
              id="proposal_theme"
              type="select"
              valueLink={this.linkState('form.theme')}
              label={themeLabel}
              groupClassName={this.getGroupStyle('theme')}
              errors={this.renderFormErrors('theme')}
              help={form.themeHelpText}
            >
              <option value={-1} disabled>{this.getIntlMessage('proposal.select.theme')}</option>
              {
                themes.map((theme) => {
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
          categories.length > 0 && form.usingCategories
          && <Input
            id="proposal_category"
            type="select"
            valueLink={this.linkState('form.category')}
            label={categoryLabel}
            groupClassName={this.getGroupStyle('category')}
            errors={this.renderFormErrors('category')}
            help={form.categoryHelpText}
          >
            <option value={-1} disabled>{this.getIntlMessage('proposal.select.category')}</option>
            {
              categories.map((category) => {
                return (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                );
              })
            }
          </Input>
        }

        {
          features.districts
          && <Input
            id="proposal_district"
            type="select"
            valueLink={this.linkState('form.district')}
            label={this.getIntlMessage('proposal.district')}
            groupClassName={this.getGroupStyle('district')}
            errors={this.renderFormErrors('district')}
            help={form.districtHelpText}
          >
            <option value={-1} disabled>{this.getIntlMessage('proposal.select.district')}</option>
            {
              districts.map((district) => {
                return (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                );
              })
            }
          </Input>
        }

      <Input
        id="proposal_body"
        type="editor"
        label={this.getIntlMessage('proposal.body')}
        groupClassName={this.getGroupStyle('body')}
        errors={this.renderFormErrors('body')}
        valueLink={this.linkState('form.body')}
        help={form.descriptionHelpText}
      />

      {
        form.fields.map((field) => {
          const key = 'custom-' + field.id;
          const label = (
            <span>
              {field.question}
              {!field.required && optional}
            </span>
          );
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

const mapStateToProps = (state) => {
  return {
    features: state.default.features,
  };
};

export default connect(mapStateToProps)(ProposalForm);
