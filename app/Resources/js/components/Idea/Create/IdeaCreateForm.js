import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import IdeaActions from '../../../actions/IdeaActions';
import IdeaForm from '../Form/IdeaForm';
import { connect } from 'react-redux';

const IdeaCreateForm = React.createClass({
  propTypes: {
    themes: PropTypes.array.isRequired,
    themeId: PropTypes.number,
    isSubmitting: PropTypes.bool.isRequired,
    onValidationFailure: PropTypes.func,
    onSubmitSuccess: PropTypes.func,
    onSubmitFailure: PropTypes.func,
    idea: PropTypes.object,
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
    const {
      onSubmitSuccess,
      onSubmitFailure,
      features,
      isSubmitting,
      onValidationFailure,
    } = this.props;
    if (!isSubmitting && nextProps.isSubmitting) {
      const ideaForm = this.ideaForm;
      if (ideaForm.isValid()) {
        const form = ideaForm.state.form;
        if (!features.themes) {
          delete form.theme;
        }
        if (form.media === false) {
          form.delete_media = true;
          delete form.media;
        } else if (!form.media || !form.media instanceof File) {
          delete form.media;
        }
        delete form.confirm;
        Object.keys(form).map((key) => {
          if (typeof form[key] === 'undefined') {
            delete form[key];
          }
        });
        return IdeaActions
          .add(form)
          .then(() => {
            ideaForm.reinitState();
            onSubmitSuccess();
          })
          .catch(onSubmitFailure)
        ;
      }

      onValidationFailure();
    }
  },

  render() {
    const { features } = this.props;
    return (
      <IdeaForm
        ref={(c) => this.ideaForm = c}
        {...this.props}
        showThemes={features.themes}
      />
    );
  },

});

const mapStateToProps = (state) => {
  return { features: state.default.features };
};

export default connect(mapStateToProps)(IdeaCreateForm);
