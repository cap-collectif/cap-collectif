import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import FormMixin from '../../../utils/FormMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import FlashMessages from '../../Utils/FlashMessages';
import Input from '../../Form/Input';

const IdeaForm = React.createClass({
  propTypes: {
    themes: PropTypes.array.isRequired,
    themeId: PropTypes.number,
    isSubmitting: PropTypes.bool.isRequired,
    onValidationFailure: PropTypes.func.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onSubmitFailure: PropTypes.func.isRequired,
    idea: PropTypes.object,
    showThemes: PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin, DeepLinkStateMixin, FormMixin],

  getDefaultProps() {
    return {
      themeId: -1,
      idea: null,
    };
  },

  getInitialState() {
    const { idea } = this.props;
    return {
      form: {
        title: idea ? idea.title : '',
        body: idea ? idea.body : '',
        object: idea ? idea.object : '',
        url: idea ? idea.url : '',
        media: null,
        theme: idea ? idea.theme.id : this.props.themeId,
        confirm: !!!idea,
      },
      errors: {
        title: [],
        body: [],
        object: [],
        url: [],
        media: [],
        theme: [],
        confirm: [],
      },
    };
  },

  componentDidMount() {
    this.updateThemeConstraint();
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.showThemes !== this.props.showThemes) {
      this.updateThemeConstraint();
    }
  },

  reinitState() {
    this.setState(this.getInitialState());
  },

  updateThemeConstraint() {
    if (this.props.showThemes) {
      this.formValidationRules.theme = {
        minValue: { value: 0, message: 'idea.constraints.theme' },
      };
      return;
    }
    this.formValidationRules.theme = {};
  },

  formValidationRules: {
    title: {
      min: { value: 2, message: 'idea.constraints.title' },
      notBlank: { message: 'idea.constraints.title' },
    },
    body: {
      min: { value: 2, message: 'idea.constraints.body' },
      notBlank: { message: 'idea.constraints.body' },
    },
    object: {
      min: { value: 2, message: 'idea.constraints.object' },
      notBlank: { message: 'idea.constraints.object' },
    },
    url: {
      isUrl: { message: 'idea.constraints.url' },
    },
    confirm: {
      isTrue: { message: 'idea.constraints.confirm' },
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
    const { idea } = this.props;
    return (
      <form id="idea-form" ref="form">
        {idea
          ? <div className="alert alert-warning edit-confirm-alert">
              <Input
                  type="checkbox"
                  ref="confirm"
                  id="idea_confirm"
                  checkedLink={this.linkState('form.confirm')}
                  label={this.getIntlMessage('idea.confirm')}
                  labelClassName=""
                  groupClassName={this.getGroupStyle('confirm')}
                  errors={this.renderFormErrors('confirm')}
              />
            </div>
          : null
        }
        <Input
          id="idea_title"
          type="text"
          ref="title"
          valueLink={this.linkState('form.title')}
          label={this.getIntlMessage('idea.form.title') + ' *'}
          groupClassName={this.getGroupStyle('title')}
          errors={this.renderFormErrors('title')}
        />

        {
          this.props.showThemes
            ? <Input
              id="idea_theme"
              type="select"
              ref="theme"
              valueLink={this.linkState('form.theme')}
              label={this.getIntlMessage('idea.form.theme') + ' *'}
              groupClassName={this.getGroupStyle('theme')}
              errors={this.renderFormErrors('theme')}
            >
              <option value={-1} disabled>{this.getIntlMessage('idea.form.select_theme')}</option>
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

      <Input
        id="idea_body"
        type="editor"
        label={this.getIntlMessage('idea.form.body') + ' *'}
        groupClassName={this.getGroupStyle('body')}
        errors={this.renderFormErrors('body')}
        valueLink={this.linkState('form.body')}
      />

      <Input
        id="idea_object"
        type="editor"
        label={this.getIntlMessage('idea.form.object') + ' *'}
        groupClassName={this.getGroupStyle('object')}
        errors={this.renderFormErrors('object')}
        valueLink={this.linkState('form.object')}
      />

      <Input
        id="idea_url"
        type="text"
        label={this.getIntlMessage('idea.form.url')}
        groupClassName={this.getGroupStyle('url')}
        errors={this.renderFormErrors('url')}
        valueLink={this.linkState('form.url')}
        help={this.getIntlMessage('idea.form.url_help')}
        placeholder={this.getIntlMessage('idea.form.url_placeholder')}
      />

      <Input
        id="idea_media"
        type="image"
        image={idea && idea.media ? idea.media.url : null}
        label={this.getIntlMessage('idea.form.media')}
        groupClassName={this.getGroupStyle('media')}
        errors={this.renderFormErrors('media')}
        valueLink={this.linkState('form.media')}
      />

      </form>
    );
  },

});

export default IdeaForm;
