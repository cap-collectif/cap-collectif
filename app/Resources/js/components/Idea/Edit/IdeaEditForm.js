import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import IdeaActions from '../../../actions/IdeaActions';
import IdeaForm from '../Form/IdeaForm';
import { connect } from 'react-redux';

const IdeaEditForm = React.createClass({
  propTypes: {
    themes: React.PropTypes.array.isRequired,
    themeId: React.PropTypes.number,
    isSubmitting: React.PropTypes.bool.isRequired,
    onValidationFailure: React.PropTypes.func,
    onSubmitSuccess: React.PropTypes.func,
    onSubmitFailure: React.PropTypes.func,
    idea: React.PropTypes.object,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      themeId: -1,
      idea: null,
      onSubmitSuccess: () => {},
      onSubmitFailure: () => {},
      onValidationFailure: () => {},
    };
  },

  componentWillReceiveProps(nextProps) {
    if (!this.props.isSubmitting && nextProps.isSubmitting) {
      const { idea, onSubmitSuccess, onSubmitFailure } = this.props;
      const ideaForm = this.ideaForm;
      if (ideaForm.isValid()) {
        const form = ideaForm.state.form;
        if (!this.props.features.themes) {
          delete form.theme;
        }
        if (form.media === false) {
          form.delete_media = true;
          delete form.media;
        } else if (!form.media || !form.media instanceof File) {
          delete form.media;
        }
        Object.keys(form).map((key) => {
          if (typeof form[key] === 'undefined') {
            delete form[key];
          }
        });
        delete form.confirm;
        return IdeaActions
          .update(idea.id, form)
          .then(onSubmitSuccess)
          .catch(onSubmitFailure)
        ;
      }

      this.props.onValidationFailure();
    }
  },

  render() {
    return (
      <IdeaForm
        ref={(c) => this.ideaForm = c}
        {...this.props}
        showThemes={this.props.features.themes}
      />
    );
  },

});
const mapStateToProps = (state) => {
  return { features: state.default.features };
};

export default connect(mapStateToProps)(IdeaEditForm);
