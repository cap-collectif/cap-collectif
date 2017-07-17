// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import IdeaActions from '../../../actions/IdeaActions';
import IdeaForm from '../Form/IdeaForm';
import { hideIdeaCreateModal } from '../../../redux/modules/idea';

const onSubmit = (values, dispatch, props) => {
  const form = values;
  if (!props.features.themes) {
    delete form.theme;
  }
  if (form.media === false) {
    form.delete_media = true;
    delete form.media;
  } else if (!form.media || !(form.media instanceof File)) {
    delete form.media;
  }
  delete form.confirm;
  Object.keys(form).map(key => {
    if (typeof form[key] === 'undefined') {
      delete form[key];
    }
  });
  return IdeaActions.add(form).then(() => {
    dispatch(hideIdeaCreateModal());
    if (props.themeId !== -1) {
      location.reload();
    }
    IdeaActions.load();
  });
};
export const formName = 'idea-create-form';

const IdeaCreateForm = React.createClass({
  propTypes: {
    themes: PropTypes.array.isRequired,
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
  return { features: state.default.features };
};

export default connect(mapStateToProps)(IdeaCreateForm);
