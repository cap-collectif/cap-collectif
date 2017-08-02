// @flow
import React, { Component } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import ChangeProposalContentMutation from '../../../mutations/ChangeProposalContentMutation';
import component from '../../Form/Field';
import type { ProposalAdminContentForm_proposal } from './__generated__/ProposalAdminContentForm_proposal.graphql';
import type { FeatureToggles } from '../../../types';

type DefaultProps = void;
type Props = {
  proposal: ProposalAdminContentForm_proposal,
  themes: Array<Object>,
  districts: Array<Object>,
  features: FeatureToggles,
};
type State = void;

export class ProposalAdminContentForm extends Component<
  DefaultProps,
  Props,
  State,
> {
  _handleCompleteChange = () => {
    const variables = {
      input: { title: '', body: '', id: this.props.proposal.id },
    };
    ChangeProposalContentMutation.commit(variables);
  };

  render() {
    const { features, districts, themes /* , handleSubmit */ } = this.props;
    const categories = [];
    const form = {};
    const optional = (
      <span className="excerpt">
        <FormattedMessage id="global.form.optional" />
      </span>
    );
    const themeLabel = (
      <span>
        <FormattedMessage id="proposal.theme" />
        {!form.themeMandatory && optional}
      </span>
    );
    const categoryLabel = (
      <span>
        <FormattedMessage id="proposal.category" />
        {!form.categoryMandatory && optional}
      </span>
    );
    const districtLabel = (
      <span>
        <FormattedMessage id="proposal.district" />
        {!form.districtMandatory && optional}
      </span>
    );
    // const illustration = (
    //   <span>
    //     <FormattedMessage id="proposal.media" />
    //     {optional}
    //   </span>
    // );
    return (
      <div>
        <form>
          <h4 className="box-title">Aperçu</h4>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/115-section-avancement">
            <i className="fa fa-info-circle" /> Aide
          </a>
          <div>
            <Field
              name="title"
              component={component}
              type="text"
              placeholder="First Name"
              id="proposal_title"
              help={form.titleHelpText}
              label={<FormattedMessage id="proposal.title" />}
            />
            {features.themes &&
              form.usingThemes &&
              <Field
                name="theme"
                id="proposal_theme"
                type="select"
                component={component}
                label={themeLabel}
                help={form.themeHelpText}>
                <FormattedMessage id="proposal.select.theme">
                  {message =>
                    <option value={-1} disabled>
                      {message}
                    </option>}
                </FormattedMessage>
                {themes.map(theme =>
                  <option key={theme.id} value={theme.id}>
                    {theme.title}
                  </option>,
                )}
              </Field>}
            {categories.length > 0 &&
              form.usingCategories &&
              <Field
                id="proposal_category"
                type="select"
                name="category"
                component={component}
                label={categoryLabel}
                help={form.categoryHelpText}>
                <FormattedMessage id="proposal.select.category">
                  {message =>
                    <option value={-1} disabled>
                      {message}
                    </option>}
                </FormattedMessage>
                {categories.map(category => {
                  return (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  );
                })}
              </Field>}
            {features.districts &&
              form.usingDistrict &&
              districts.length > 0 &&
              <Field
                id="proposal_district"
                type="select"
                name="district"
                component={component}
                label={districtLabel}
                help={form.districtHelpText}>
                <FormattedMessage id="proposal.select.district">
                  {message =>
                    <option value="">
                      {message}
                    </option>}
                </FormattedMessage>
                {districts.map(district =>
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>,
                )}
              </Field>}
            <Field
              id="proposal_body"
              type="editor"
              name="body"
              component={component}
              label={<FormattedMessage id="proposal.body" />}
              help={form.descriptionHelpText}
            />
            {/* <Field
                id="proposal_media"
                name="media"
                component={component}
                type="image"
                image={proposal && proposal.media ? proposal.media.url : null}
                label={illustration}
              /> */}
          </div>
        </form>
      </div>
    );
  }
}

const form = reduxForm({
  // onSubmit,
  // validate,
  form: 'proposal-admin-edit',
})(ProposalAdminContentForm);

const mapStateToProps = (state, props) => ({
  features: state.default.features,
  themes: state.default.themes,
  districts: state.default.districts,
  initialValues: {
    title: props.proposal.title,
    body: props.proposal.body,
  },
});

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(
  container,
  graphql`
    fragment ProposalAdminContentForm_proposal on Proposal {
      id
      title
      body
      # author {
      #   id
      # }
      # theme {
      #   id
      # }
      # category {
      #   id
      # }
      # address
      # district {
      #   id
      # }
      # description
      # phone
    }
  `,
);
