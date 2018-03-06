// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import renderComponent from '../../Form/Field';
import { isUrl } from '../../../services/Validator';
import type { State } from '../../../types';

const validate = ({ title, body, object, url, confirm, theme }: Object, { showThemes }: Object) => {
  const errors = {};
  if (!title || title.length <= 2) {
    errors.title = 'idea.constraints.title';
  }
  if (!body || body.length <= 2) {
    errors.body = 'idea.constraints.body';
  }
  if (!object || object.length <= 2) {
    errors.object = 'idea.constraints.object';
  }
  if (url && !isUrl(url)) {
    errors.url = 'idea.constraints.url';
  }
  if (!confirm) {
    errors.confirm = 'idea.constraints.confirm';
  }
  if (showThemes && !theme) {
    errors.theme = 'idea.constraints.theme';
  }
  return errors;
};

export const IdeaForm = React.createClass({
  propTypes: {
    themes: PropTypes.array.isRequired,
    themeId: PropTypes.string,
    idea: PropTypes.object,
    showThemes: PropTypes.bool.isRequired,
  },

  getDefaultProps() {
    return {
      themeId: null,
    };
  },

  render() {
    const { idea, showThemes, themes } = this.props;
    return (
      <form id="idea-form">
        {idea && (
          <div className="alert alert-warning edit-confirm-alert">
            <Field
              type="checkbox"
              component={renderComponent}
              id="idea_confirm"
              name="confirm"
              children={<FormattedMessage id="idea.confirm" />}
            />
          </div>
        )}
        <Field
          id="idea_title"
          type="text"
          component={renderComponent}
          name="title"
          label={<FormattedMessage id="idea.form.title" />}
        />
        {showThemes && (
          <Field
            id="idea_theme"
            type="select"
            component={renderComponent}
            name="theme"
            label={<FormattedMessage id="idea.form.theme" />}>
            <option value={-1} disabled>
              {<FormattedMessage id="idea.form.select_theme" />}
            </option>
            {themes.map(theme => {
              return (
                <option key={theme.id} value={theme.id}>
                  {theme.title}
                </option>
              );
            })}
          </Field>
        )}
        <Field
          id="idea_body"
          type="editor"
          name="body"
          component={renderComponent}
          label={<FormattedMessage id="idea.form.body" />}
        />
        <Field
          id="idea_object"
          type="editor"
          name="object"
          component={renderComponent}
          label={<FormattedMessage id="idea.form.object" />}
        />
        <Field
          id="idea_url"
          type="text"
          name="url"
          component={renderComponent}
          label={<FormattedMessage id="idea.form.url" />}
          help={<FormattedMessage id="idea.form.url_help" />}
          placeholder="idea.form.url_placeholder"
        />
        <Field
          id="idea_media"
          type="image"
          name="media"
          component={renderComponent}
          image={idea && idea.media ? idea.media.url : null}
          label={<FormattedMessage id="idea.form.media" />}
        />
      </form>
    );
  },
});

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, { idea, themeId }) => {
  return {
    themes: state.default.themes,
    initialValues: {
      title: idea ? idea.title : '',
      body: idea ? idea.body : '',
      object: idea ? idea.object : '',
      url: idea ? idea.url : '',
      media: null,
      theme: idea ? idea.theme.id : themeId,
      confirm: !!!idea, // eslint-disable-line no-extra-boolean-cast
    },
  };
};

const connector = connect(mapStateToProps, null, null, { withRef: true });
export default connector(
  reduxForm({
    validate,
  })(IdeaForm),
);
