import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import renderInput from '../../Form/Field';
import { renderSelect } from '../../Form/Select';

const formName = 'proposal';

const validate = (values) => {
  console.log(values);
};

let ProposalAdminForm = React.createClass({
  propTypes: {
    proposalForm: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    districts: PropTypes.array.isRequired,
    themes: PropTypes.array.isRequired,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { districts, themes, features, user, proposalForm } = this.props;
    const optional = <span className="excerpt">{` ${this.getIntlMessage('global.form.optional')}`}</span>;
    // const illustration = (
    //   <span>
    //     {this.getIntlMessage('proposal.media')}
    //     {optional}
    //   </span>
    // );
    return (
      <form className="form-horizontal">
        <Field
          name="author"
          label="Auteur"
          options={[{ label: user.displayName, value: user.id }, { label: 'lol', value: 899 }]}
          component={renderSelect}
          clearable={false}
          autoload={false}
          loadOptions={() => Promise.resolve({ options: [{ label: user.displayName, value: user.id }, { label: 'lol', value: 899 }] })}
        />
        <Field
          name="title"
          label="Titre"
          type="text"
          autoComplete="off"
          labelClassName="col-sm-2"
          wrapperClassName="col-sm-10"
          component={renderInput}
        />
        <Field
          name="body"
          type="editor"
          component={renderInput}
          label={this.getIntlMessage('proposal.body')}
          labelClassName="col-sm-2"
          wrapperClassName="col-sm-10"
          // help={proposalForm.descriptionHelpText}
        />
        {
          proposalForm.usingCategories && proposalForm.categories.length > 0 &&
            <Field
              name="category"
              clearable={!proposalForm.categoryMandatory}
              label={
                <span>
                  {this.getIntlMessage('proposal.category')}
                  {!proposalForm.categoryMandatory && optional}
                </span>
              }
              component={renderSelect}
              // help={proposalForm.categoryHelpText}
              placeholder={this.getIntlMessage('proposal.select.category')}
              options={proposalForm.categories.map(c => ({ value: c.id, label: c.name }))}
            />
        }
        {
          features.themes && proposalForm.usingThemes &&
            <Field
                name="theme"
                placeholder={this.getIntlMessage('proposal.select.theme')}
                options={themes.map(t => ({ value: t.id, label: t.title }))}
                component={renderSelect}
                clearable={!proposalForm.themeMandatory}
                label={
                  <span>
                    {this.getIntlMessage('proposal.theme')}
                    {!proposalForm.themeMandatory && optional}
                  </span>
                }
                // help={proposalForm.themeHelpText}
            />
        }
        {
          features.districts && proposalForm.usingDistrict &&
            <Field
              name="district"
              placeholder={this.getIntlMessage('proposal.select.district')}
              component={renderSelect}
              clearable={!proposalForm.districtMandatory}
              label={
                <span>
                  {this.getIntlMessage('proposal.district')}
                  {!proposalForm.districtMandatory && optional}
                </span>
              }
              help={proposalForm.districtHelpText}
              options={districts.map(d => ({ value: d.id, label: d.name }))}
            />
        }
        {
          // <FieldArray name="responses" component={renderMembers}/>
        //   proposalForm.fields.map(field =>
        //       <Field
        //         name={`responses${field.id}`}
        //         type={field.type}
        //         component={renderInput}
        //         /* label={(
        //           <span>
        //             {field.question}
        //             {!field.required && optional}
        //           </span>
        //         )}*/
        //         // help={field.helpText}
        //       />
        //   )
        }
              {/* <ProposalPrivateField
                show={field.private}
                children={input}
              /> */}
      </form>
    );
  },
});

ProposalAdminForm = reduxForm({
  form: formName,
  destroyOnUnmount: false,
  validate,
})(ProposalAdminForm);

ProposalAdminForm = connect(state => ({
  initialValues: { author: state.default.user.id },
  user: state.default.user,
  features: state.default.features,
  themes: state.default.themes,
  districts: state.default.districts,
}))(ProposalAdminForm);
export default ProposalAdminForm;
