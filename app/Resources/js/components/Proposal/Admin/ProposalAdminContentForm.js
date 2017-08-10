// @flow
import React, { Component } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button } from 'react-bootstrap';
import ChangeProposalContentMutation from '../../../mutations/ChangeProposalContentMutation';
import component from '../../Form/Field';
import select from '../../Form/Select';
import ProposalMediaResponse from '../Page/ProposalMediaResponse';
import type { ProposalAdminContentForm_proposal } from './__generated__/ProposalAdminContentForm_proposal.graphql';
import type { GlobalState, FeatureToggles } from '../../../types';

type DefaultProps = void;
type PassedProps = {
  proposal: ProposalAdminContentForm_proposal,
};
type Props = {
  proposal: ProposalAdminContentForm_proposal,
  themes: Array<Object>,
  districts: Array<Object>,
  features: FeatureToggles,
  handleSubmit: () => void,
  intl: Object,
};
type State = void;

const formName = 'proposal-admin-edit';

const onSubmit = (values, dispatch, props: Props) => {
  // Only used for the user view
  delete values.addressText;

  // We must remove Files to upload from variables and put them in uploadables
  const uploadables = {};
  if (values.media instanceof File) {
    // User wants to upload a new media
    uploadables.media = values.media;
  }
  delete values.media;

  values.responses = values.responses.filter(res => {
    if (!res.medias) {
      // We only send value responses
      return true;
    }
    for (const media of res.medias) {
      if (media instanceof File) {
        uploadables[`responses_${res.question}`] = media;
      }
    }
    return false;
  });

  const variables = {
    input: { ...values, id: props.proposal.id },
  };
  ChangeProposalContentMutation.commit(variables, uploadables);
};

const validate = () => {
  const errors = {};
  return errors;
};

export class ProposalAdminContentForm extends Component<
  DefaultProps,
  Props,
  State,
> {
  render() {
    const { proposal, features, districts, themes, handleSubmit } = this.props;
    const form = proposal.form;
    const categories = proposal.form.categories;
    const optional = (
      <span className="excerpt">
        <FormattedMessage id="global.form.optional" />
      </span>
    );
    return (
      <div className="box box-primary container">
        <form onSubmit={handleSubmit}>
          <h4 className="h4">Aperçu</h4>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/86-editer-une-proposition-dune-etape-de-depot#contenu">
            <i className="fa fa-info-circle" /> Aide
          </a>
          <div>
            <Field
              name="title"
              component={component}
              type="text"
              id="proposal_title"
              label={<FormattedMessage id="proposal.title" />}
            />
            <h4 className="h4">Métadonnées</h4>
            <Field
              name="author"
              label="Auteur"
              id="proposal-admin-author"
              labelClassName="control-label"
              inputClassName="qdnsqdnqsldnqsldn"
              options={[
                {
                  label: proposal.author.displayName,
                  value: proposal.author.id,
                },
              ]}
              component={select}
              clearable={false}
              autoload={false}
              cache={false}
              loadOptions={() =>
                Promise.resolve({
                  options: [
                    {
                      label: proposal.author.displayName,
                      value: proposal.author.id,
                    },
                  ],
                })}
            />
            {features.themes &&
              form.usingThemes &&
              <Field
                name="theme"
                id="proposal_theme"
                type="select"
                component={component}
                label={
                  <span>
                    <FormattedMessage id="proposal.theme" />
                    {!form.themeMandatory && optional}
                  </span>
                }>
                <FormattedMessage id="proposal.select.theme">
                  {message =>
                    <option value="">
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
                label={
                  <span>
                    <FormattedMessage id="proposal.category" />
                    {!form.categoryMandatory && optional}
                  </span>
                }>
                <FormattedMessage id="proposal.select.category">
                  {message =>
                    <option value="">
                      {message}
                    </option>}
                </FormattedMessage>
                {categories.map(category =>
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>,
                )}
              </Field>}
            {features.districts &&
              form.usingDistrict &&
              districts.length > 0 &&
              <Field
                id="proposal_district"
                type="select"
                name="district"
                component={component}
                label={
                  <span>
                    <FormattedMessage id="proposal.district" />
                    {!form.districtMandatory && optional}
                  </span>
                }>
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
            {form.usingAddress &&
              <Field
                id="proposal_address"
                component={component}
                type="address"
                name="addressText"
                formName={formName}
                label={<FormattedMessage id="proposal.map.form.field" />}
                placeholder="proposal.map.form.placeholder"
              />}
            <h4 className="h4">Présentation</h4>
            <Field
              id="proposal_body"
              type="editor"
              name="body"
              component={component}
              label={<FormattedMessage id="proposal.body" />}
            />
            <FieldArray
              name="responses"
              component={({ fields }) =>
                <div>
                  {fields.map((field, index) => {
                    const response = this.props.proposal.responses.filter(
                      res => res && res.question.id === field.id,
                    )[0];
                    return (
                      <div key={index}>
                        <Field
                          key={field.id}
                          id={field.id}
                          name={`responses.${index}.medias`}
                          type={field.inputType}
                          component={component}
                          label={field.title}
                        />
                        {response &&
                          response.medias &&
                          response.medias.length &&
                          <ProposalMediaResponse medias={response.medias} />}
                      </div>
                    );
                  })}
                </div>}
              fields={form.customFields}
            />
            <Field
              id="proposal_media"
              name="media"
              component={component}
              type="image"
              image={proposal && proposal.media ? proposal.media.url : null}
              label={
                <span>
                  <FormattedMessage id="proposal.media" />
                  {optional}
                </span>
              }
            />
            <ButtonToolbar style={{ marginBottom: 10 }}>
              <Button type="submit" bsStyle="primary">
                <FormattedMessage id="global.save" />
              </Button>
            </ButtonToolbar>
          </div>
        </form>
      </div>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  form: formName,
})(ProposalAdminContentForm);

const mapStateToProps = (state: GlobalState, { proposal }: PassedProps) => ({
  features: state.default.features,
  themes: state.default.themes,
  districts: state.default.districts,
  initialValues: {
    title: proposal.title,
    body: proposal.body,
    author: proposal.author.id,
    theme: state.default.features.themes
      ? proposal.theme ? proposal.theme.id : null
      : undefined,
    category: proposal.category ? proposal.category.id : null,
    district: state.default.features.districts
      ? proposal.district ? proposal.district.id : null
      : undefined,
    address: proposal.address,
    media: null,
    responses: proposal.form.customFields.map(field => {
      const response = proposal.responses.filter(
        res => res && res.question.id === field.id,
      )[0];
      if (response) {
        if (response.value) {
          return {
            question: parseInt(field.id, 10),
            value: response.value,
          };
        }
        return {
          question: parseInt(field.id, 10),
          medias: response.medias,
        };
      }
      if (field.inputType === 'medias') {
        return { question: parseInt(field.id, 10), medias: [] };
      }
      return { question: parseInt(field.id, 10), value: null };
    }),
    addressText:
      proposal.address && JSON.parse(proposal.address)[0].formatted_address,
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
      responses {
        question {
          id
        }
        ... on ValueResponse {
          value
        }
        ... on MediaResponse {
          medias {
            id
            name
            size
            url
          }
        }
      }
      media {
        id
        url
      }
      form {
        categories {
          id
          name
        }
        customFields {
          id
          title
          inputType
          position
          private
          required
        }
        usingDistrict
        districtMandatory
        districtHelpText
        usingThemes
        themeMandatory
        usingCategories
        categoryMandatory
        categoryHelpText
        usingAddress
        titleHelpText
        descriptionHelpText
      }
      author {
        id
        displayName
      }
      theme {
        id
      }
      category {
        id
      }
      address
      district {
        id
      }
    }
  `,
);
