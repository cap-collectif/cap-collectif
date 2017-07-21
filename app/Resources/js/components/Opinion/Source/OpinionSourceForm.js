// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import OpinionSourceActions from '../../../actions/OpinionSourceActions';
import renderComponent from '../../Form/Field';
import CategoriesStore from '../../../stores/CategoriesStore';
import { isUrl } from '../../../services/Validator';
import {
  hideSourceCreateModal,
  hideSourceEditModal,
} from '../../../redux/modules/opinion';

const validate = ({ title, body, category, link, check }: Object) => {
  const errors = {};
  if (!title || title.length <= 2) {
    errors.title = 'source.constraints.title';
  }
  if (!body || body.length <= 2) {
    errors.body = 'source.constraints.body';
  }
  if (!category) {
    errors.category = 'source.constraints.category';
  }
  if (!link || !isUrl(link)) {
    errors.link = 'source.constraints.link';
  }
  if (!check) {
    errors.check = 'source.constraints.check';
  }
  return errors;
};

const onSubmit = (values, dispatch, props) => {
  const { opinion, source } = props;
  const tmpFixData: Object = values;
  tmpFixData.Category = parseInt(tmpFixData.category, 10);
  delete tmpFixData.category;
  delete tmpFixData.check;

  if (!source) {
    return OpinionSourceActions.add(opinion, tmpFixData).then(() => {
      dispatch(hideSourceCreateModal());
      OpinionSourceActions.load(opinion, 'last');
    });
  }

  return OpinionSourceActions.update(
    opinion,
    source.id,
    tmpFixData,
  ).then(() => {
    dispatch(hideSourceEditModal());
    OpinionSourceActions.load(opinion, 'last');
  });
};

export const formName = 'opinion-source-form';

const OpinionSourceForm = React.createClass({
  propTypes: {
    opinion: PropTypes.object.isRequired,
    source: PropTypes.object,
  },

  render() {
    const { source } = this.props;
    return (
      <form id="source-form">
        {source &&
          <div className="alert alert-warning edit-confirm-alert">
            <Field
              type="checkbox"
              name="check"
              id="sourceEditCheck"
              component={renderComponent}
              children={<FormattedMessage id="source.check" />}
            />
          </div>}
        <Field
          type="select"
          name="category"
          id="sourceCategory"
          component={renderComponent}
          label={<FormattedMessage id="source.type" />}>
          {source
            ? null
            : <option value="" disabled>
                {<FormattedMessage id="global.select" />}
              </option>}
          {CategoriesStore.categories.map(category => {
            return (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            );
          })}
        </Field>
        <Field
          id="sourceLink"
          name="link"
          component={renderComponent}
          type="text"
          label={<FormattedMessage id="source.link" />}
          placeholder="http://"
        />
        <Field
          id="sourceTitle"
          type="text"
          name="title"
          component={renderComponent}
          label={<FormattedMessage id="source.title" />}
        />
        <Field
          id="sourceBody"
          type="editor"
          component={renderComponent}
          name="body"
          label={<FormattedMessage id="source.body" />}
        />
      </form>
    );
  },
});

export default connect((state, { source }) => ({
  initialValues: {
    link: source ? source.link : '',
    title: source ? source.title : '',
    body: source ? source.body : '',
    category: source ? source.category.id : null,
    check: !source,
  },
}))(
  reduxForm({
    validate,
    onSubmit,
    form: formName,
  })(OpinionSourceForm),
);
