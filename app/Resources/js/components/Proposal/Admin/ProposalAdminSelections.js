import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import renderInput from '../../Form/Field';
import { renderSelect } from '../../Form/Select';
import Fetcher from '../../../services/Fetcher';

const formName = 'proposalSelections';

const validate = values => {
  const errors = {};
  if (!values.title) {
    errors.title = 'global.required';
  }
  return errors;
};

export const ProposalAdminSelections = React.createClass({
  propTypes: {
    steps: PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { steps } = this.props;

    return (
      <div>
        { steps.map(s => <div>{s.title}</div>)}
      </div>
    );
    // return (
    //   <form className="form-horizontal">
    //
    //     <Field
    //       name="title"
    //       label="Titre"
    //       type="text"
    //       autoComplete="off"
    //       labelClassName="col-sm-2"
    //       wrapperClassName="col-sm-10"
    //       component={renderInput}
    //     />
    //     <Field
    //       name="body"
    //       type="editor"
    //       component={renderInput}
    //       label={this.getIntlMessage('proposal.body')}
    //       labelClassName="col-sm-2"
    //       wrapperClassName="col-sm-10"
    //     />
    //     {
    //       proposalForm.usingCategories && proposalForm.categories.length > 0 &&
    //         <Field
    //           name="category"
    //           clearable={!proposalForm.categoryMandatory}
    //           label={
    //             <span>
    //               {this.getIntlMessage('proposal.category')}
    //               {!proposalForm.categoryMandatory && optional}
    //             </span>
    //           }
    //           component={renderSelect}
    //           placeholder={this.getIntlMessage('proposal.select.category')}
    //           options={proposalForm.categories.map(c => ({ value: c.id, label: c.name }))}
    //         />
    //     }
    //     {
    //       features.themes && proposalForm.usingThemes &&
    //         <Field
    //           name="theme"
    //           placeholder={this.getIntlMessage('proposal.select.theme')}
    //           options={themes.map(t => ({ value: t.id, label: t.title }))}
    //           component={renderSelect}
    //           clearable={!proposalForm.themeMandatory}
    //           label={
    //             <span>
    //               {this.getIntlMessage('proposal.theme')}
    //               {!proposalForm.themeMandatory && optional}
    //             </span>
    //           }
    //         />
    //     }
    //     {
    //       features.districts && proposalForm.usingDistrict &&
    //         <Field
    //           name="district"
    //           placeholder={this.getIntlMessage('proposal.select.district')}
    //           component={renderSelect}
    //           clearable={!proposalForm.districtMandatory}
    //           label={
    //             <span>
    //               {this.getIntlMessage('proposal.district')}
    //               {!proposalForm.districtMandatory && optional}
    //             </span>
    //           }
    //           options={districts.map(d => ({ value: d.id, label: d.name }))}
    //         />
    //     }
    //     {
    //       proposalForm.fields.map((field, index) =>
    //         <Field
    //           name={`responses[${index}].value`}
    //           type={field.type}
    //           component={renderInput}
    //           labelClassName="col-sm-2"
    //           wrapperClassName="col-sm-10"
    //           label={
    //             <span>
    //               {field.question}
    //               {!field.required && optional}
    //             </span>
    //           }
    //         />
    //       )
    //     }
    //     <Field
    //       name="media"
    //       type="image"
    //       component={renderInput}
    //       labelClassName="col-sm-2"
    //       wrapperClassName="col-sm-10"
    //       label={
    //         <span>
    //           {this.getIntlMessage('proposal.media')}
    //           {optional}
    //         </span>
    //       }
    //     />
    //   </form>
  },
});

const wrapWithFetchedData = Component => React.createClass({
  contextTypes: Component.contextTypes,
  getInitialState() {
    return {};
  },
  componentDidMount() {
    console.log(this.props);
    Fetcher
      .get(`/projects/${this.props.projectId}/steps`)
      .then(res => {
        console.log(res);
        this.setState({ steps: res });
      });
  },
  render() {
    return Object.keys(this.state).length > 0
      ? <Component {...this.props} {...this.state} />
      : null;
  },
});


export default wrapWithFetchedData(connect((state, props) => ({
  initialValues: {
    project: parseInt(formValueSelector(formName)(state, 'project'), 10), // keepDirty fails
    author: state.default.user.id,
    responses: props.proposalForm.fields.map(field => ({ question: field.id })),
  },
  user: state.default.user,
  features: state.default.features,
  themes: state.default.themes,
  districts: state.default.districts,
}))(reduxForm({
  form: formName,
  validate,
})(ProposalAdminSelections)));
