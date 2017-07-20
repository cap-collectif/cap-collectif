// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import IdeaActions from '../../../actions/IdeaActions';
import IdeaForm from '../Form/IdeaForm';

const onSubmit = (values, dispatch, props) => {
  const form = values;
  form.url = form.url || '';
  if (!props.features.themes) {
    delete form.theme;
  }
  if (form.media === false) {
    form.delete_media = true;
    delete form.media;
  } else if (!form.media || !(form.media instanceof File)) {
    delete form.media;
  }
  Object.keys(form).map(key => {
    if (typeof form[key] === 'undefined') {
      delete form[key];
    }
  });
  delete form.confirm;
  return IdeaActions.update(props.idea.id, form).then(() => {
    location.reload();
  });
};

export const formName = 'idea-edit-form';

const IdeaEditForm = React.createClass({
  propTypes: {
    themeId: PropTypes.number,
    idea: PropTypes.object,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      themeId: -1,
      idea: null,
    };
  },

  render() {
    const { features } = this.props;
    return (
      <IdeaForm
        {...this.props}
        showThemes={features.themes}
        onSubmit={onSubmit}
        form={formName}
      />
    );
  },
});
const mapStateToProps = state => {
  return {
    features: state.default.features,
  };
};

export default connect(mapStateToProps)(IdeaEditForm);
