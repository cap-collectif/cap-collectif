// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import {
  type FormProps,
  SubmissionError,
  reduxForm,
  Field,
  FieldArray,
  formValueSelector,
} from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { ListGroup, ListGroupItem, Panel, ButtonToolbar, Button } from 'react-bootstrap';
import Fetcher from '../../../services/Fetcher';
import ChangeProposalContentMutation from '../../../mutations/ChangeProposalContentMutation';
import UpdateProposalFusionMutation from '../../../mutations/UpdateProposalFusionMutation';
import component from '../../Form/Field';
import select from '../../Form/Select';
import AlertForm from '../../Alert/AlertForm';
import ProposalFusionEditModal from './ProposalFusionEditModal';
import type { ProposalAdminContentForm_proposal } from '~relay/ProposalAdminContentForm_proposal.graphql';
import type { ProposalForm_proposalForm } from '../Form/__generated__/ProposalForm_proposalForm.graphql';
import type { Uuid, GlobalState, Dispatch, FeatureToggles } from '../../../types';
import {
  renderResponses,
  formatSubmitResponses,
  formatInitialResponsesValues,
  type ResponsesInReduxForm,
  validateResponses,
} from '../../../utils/responsesHelper';

type ProposalForm = ProposalForm_proposalForm;
type FormValues = {|
  media: ?{ id: Uuid },
  responses: ResponsesInReduxForm,
  draft: boolean,
  title?: ?string,
  body?: ?string,
  summary?: ?string,
  author?: ?Uuid,
  theme?: ?Uuid,
  addresstext?: ?string,
  category?: ?Uuid,
  district?: ?Uuid,
  address?: ?string,
|};

type RelayProps = {|
  +proposal: ProposalAdminContentForm_proposal,
|};

type Props = {|
  ...FormProps,
  ...RelayProps,
  +themes: Array<{ id: Uuid, title: string }>,
  +features: FeatureToggles,
  +intl: IntlShape,
  +isSuperAdmin: boolean,
  +responses: ResponsesInReduxForm,
|};

const formName = 'proposal-admin-edit';

const onSubmit = (values: FormValues, dispatch: Dispatch, { proposal, isSuperAdmin }: Props) => {
  const input = {
    title: values.title,
    summary: values.summary,
    body: values.body,
    address: values.address,
    theme: values.theme,
    category: values.category,
    district: values.district,
    draft: values.draft,
    media: typeof values.media !== 'undefined' && values.media !== null ? values.media.id : null,
    responses: formatSubmitResponses(values.responses, proposal.form.questions),
    author: isSuperAdmin ? values.author : undefined,
    id: proposal.id,
  };

  return ChangeProposalContentMutation.commit({ input })
    .then(response => {
      if (!response.changeProposalContent || !response.changeProposalContent.proposal) {
        throw new Error('Mutation "changeProposalContent" failed.');
      }
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

export const validateProposalContent = (
  values: FormValues,
  // $FlowFixMe $refType
  proposalForm: ProposalForm,
  features: FeatureToggles,
  intl: IntlShape,
) => {
  const errors = {};
  if (!values.title || values.title.length <= 2) {
    errors.title = 'proposal.constraints.title';
  }
  if (
    proposalForm.usingSummary &&
    (values.summary && (values.summary.length > 140 || values.summary.length < 2))
  ) {
    errors.summary = 'proposal.constraints.summary';
  }
  if (
    proposalForm.usingDescription &&
    proposalForm.descriptionMandaotry &&
    (!values.body || values.body.length <= 2)
  ) {
    errors.body = 'proposal.constraints.body';
  }
  if (proposalForm.usingAddress && !values.address) {
    errors.addressText = 'proposal.constraints.address';
  }
  if (
    proposalForm.categories.length &&
    proposalForm.usingCategories &&
    proposalForm.categoryMandatory &&
    !values.category
  ) {
    errors.category = 'proposal.constraints.category';
  }
  if (
    features.districts &&
    proposalForm.usingDistrict &&
    proposalForm.districtMandatory &&
    !values.district
  ) {
    errors.district = 'proposal.constraints.district';
  }
  if (features.themes && proposalForm.usingThemes && proposalForm.themeMandatory && !values.theme) {
    errors.theme = 'proposal.constraints.theme';
  }

  const responsesError = validateResponses(
    proposalForm.questions,
    values.responses,
    'proposal',
    intl,
  );
  if (responsesError.responses && responsesError.responses.length) {
    errors.responses = responsesError.responses;
  }

  return errors;
};

const validate = (values: FormValues, { proposal, features, intl }: Props) =>
  validateProposalContent(values, proposal.form, features, intl);

type State = {
  showEditFusionModal: boolean,
};

export class ProposalAdminContentForm extends React.Component<Props, State> {
  state = {
    showEditFusionModal: false,
  };

  render() {
    const {
      pristine,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      proposal,
      features,
      submitting,
      isSuperAdmin,
      themes,
      handleSubmit,
      intl,
      change,
      responses,
    } = this.props;
    const { form } = proposal;
    const { categories } = proposal.form;
    const optional = (
      <span className="excerpt">
        {' '}
        <FormattedMessage id="global.form.optional" />
      </span>
    );
    return (
      <div className="box box-primary container-fluid">
        <ProposalFusionEditModal
          onClose={() => {
            this.setState({ showEditFusionModal: false });
          }}
          show={this.state.showEditFusionModal}
          proposal={proposal}
        />
        {proposal.mergedIn.length > 0 && (
          <Panel className="mt-30 mb-0 panel_flex">
            <Panel.Heading>
              <FormattedMessage id="grouped-into-a-new-proposal" />
            </Panel.Heading>
            <ListGroup fill>
              {proposal.mergedIn.map(parent => (
                <ListGroupItem key={parent.id}>
                  <a href={parent.adminUrl}>{parent.title}</a>
                  {parent.mergedFrom.length > 2 && (
                    <Button
                      bsStyle="danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            intl.formatMessage({ id: 'are-you-sure-you-want-to-delete-this-item' }),
                          )
                        ) {
                          UpdateProposalFusionMutation.commit({
                            input: {
                              proposalId: parent.id,
                              fromProposals: parent.mergedFrom
                                .map(child => child.id)
                                .filter(id => id !== proposal.id),
                            },
                          });
                        }
                      }}>
                      <FormattedMessage id="glodal.delete" />
                    </Button>
                  )}
                </ListGroupItem>
              ))}
            </ListGroup>
          </Panel>
        )}
        {proposal.mergedFrom.length > 0 && (
          <Panel
            className="mt-30 mb-0 panel_flex"
            header={
              <div>
                <FormattedMessage id="initial-proposals" />
                <ButtonToolbar>
                  <Button
                    bsStyle="warning"
                    onClick={() => {
                      this.setState({ showEditFusionModal: true });
                    }}>
                    <FormattedMessage id="glodal.edit" />
                  </Button>
                  <Button
                    bsStyle="danger"
                    onClick={() => {
                      if (
                        window.confirm(
                          intl.formatMessage({ id: 'are-you-sure-you-want-to-delete-this-item' }),
                        )
                      ) {
                        UpdateProposalFusionMutation.commit({
                          input: {
                            proposalId: proposal.id,
                            fromProposals: [],
                          },
                        });
                      }
                    }}>
                    <FormattedMessage id="glodal.delete" />
                  </Button>
                </ButtonToolbar>
              </div>
            }>
            <ListGroup fill>
              {proposal.mergedFrom.map(child => (
                <ListGroupItem key={child.id}>
                  <a href={child.adminUrl}>{child.title}</a>
                </ListGroupItem>
              ))}
            </ListGroup>
          </Panel>
        )}
        <form onSubmit={handleSubmit}>
          <div className="box-header">
            <h3 className="box-title">
              <FormattedMessage id="proposal.admin.glimpse" />
            </h3>
            <a
              className="pull-right link"
              target="_blank"
              rel="noopener noreferrer"
              href={intl.formatMessage({ id: 'admin.help.link.proposal.body' })}>
              <i className="fa fa-info-circle" /> Aide
            </a>
          </div>
          <div className="box-content box-content__content-form">
            <Field
              name="title"
              component={component}
              type="text"
              id="proposal_title"
              label={<FormattedMessage id="proposal.title" />}
            />
            <Field
              name="summary"
              component={component}
              type="textarea"
              id="proposal_summary"
              label={
                <span>
                  <FormattedMessage id="proposal.summary" />
                  {optional}
                </span>
              }
            />
            <Field
              name="author"
              label="Auteur"
              disabled={!isSuperAdmin}
              id="proposal-admin-author"
              labelClassName="control-label"
              inputClassName="fake-inputClassName"
              component={select}
              clearable={false}
              autoload
              loadOptions={terms =>
                Fetcher.postToJson(`/users/search`, { terms })
                  .then(res =>
                    res.users
                      .map(u => ({
                        value: u.id,
                        label: u.displayName,
                      }))
                      .concat([
                        {
                          value: proposal.author.id,
                          label: proposal.author.displayName,
                        },
                      ]),
                  )
                  // eslint-disable-next-line no-console
                  .catch(e => console.error(e))
              }
            />
            {features.themes && form.usingThemes && (
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
                  {(message: string) => <option value="">{message}</option>}
                </FormattedMessage>
                {themes.map(theme => (
                  <option key={theme.id} value={theme.id}>
                    {theme.title}
                  </option>
                ))}
              </Field>
            )}
            {categories.length > 0 && form.usingCategories && (
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
                  {(message: string) => <option value="">{message}</option>}
                </FormattedMessage>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Field>
            )}
            {features.districts && form.usingDistrict && form.districts.length > 0 && (
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
                  {(message: string) => <option value="">{message}</option>}
                </FormattedMessage>
                {form.districts.map(district => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </Field>
            )}
            {form.usingAddress && (
              <Field
                id="proposal_address"
                component={component}
                type="address"
                name="addressText"
                formName={formName}
                label={<FormattedMessage id="proposal.map.form.field" />}
                placeholder="proposal.map.form.placeholder"
              />
            )}
            <Field
              id="proposal_body"
              type="editor"
              name="body"
              component={component}
              label={<FormattedMessage id="proposal.body" />}
            />
            <FieldArray
              intl={intl}
              name="responses"
              component={renderResponses}
              form={formName}
              questions={form.questions}
              change={change}
              responses={responses}
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
            <ButtonToolbar className="box-content__toolbar">
              <Button
                type="submit"
                id="proposal_admin_content_save"
                bsStyle="primary"
                disabled={pristine || invalid || submitting}>
                <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
              </Button>
              <AlertForm
                valid={valid}
                invalid={invalid}
                submitSucceeded={submitSucceeded}
                submitFailed={submitFailed}
                submitting={submitting}
              />
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
  enableReinitialize: true,
  form: formName,
})(ProposalAdminContentForm);

const mapStateToProps = (state: GlobalState, { proposal }: RelayProps) => ({
  isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
  features: state.default.features,
  themes: state.default.themes,
  initialValues: {
    draft: proposal.publicationStatus === 'DRAFT',
    title: proposal.title,
    body: proposal.body,
    summary: proposal.summary,
    author: proposal.author.id,
    theme:
      state.default.features.themes && proposal.form.usingThemes
        ? proposal.theme
          ? proposal.theme.id
          : null
        : undefined,
    category: proposal.form.usingCategories
      ? proposal.category
        ? proposal.category.id
        : null
      : undefined,
    district:
      state.default.features.districts && proposal.form.usingDistrict
        ? proposal.district
          ? proposal.district.id
          : null
        : undefined,
    address: proposal.form.usingAddress ? proposal.address : undefined,
    media: proposal.media ? proposal.media : null,
    responses: formatInitialResponsesValues(proposal.form.questions, proposal.responses),
    addressText: proposal.formattedAddress,
  },
  responses: formValueSelector(formName)(state, 'responses'),
});

const container = connect(mapStateToProps)(injectIntl(form));
export default createFragmentContainer(
  container,
  graphql`
    fragment ProposalAdminContentForm_proposal on Proposal {
      ...ProposalFusionEditModal_proposal
      id
      mergedFrom {
        id
        adminUrl
        title
      }
      mergedIn {
        id
        adminUrl
        title
        mergedFrom {
          id
        }
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
      district {
        id
      }
      title
      body
      summary
      address
      formattedAddress
      publicationStatus
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
        id
        description
        step {
          id
        }
        districts {
          id
          name
        }
        categories {
          id
          name
        }
        questions {
          id
          ...responsesHelper_adminQuestion @relay(mask: false)
        }
        usingDistrict
        usingDescription
        usingSummary
        descriptionMandatory
        districtMandatory
        districtHelpText
        usingThemes
        themeMandatory
        usingCategories
        categoryMandatory
        categoryHelpText
        usingAddress
        titleHelpText
        summaryHelpText
        themeHelpText
        illustrationHelpText
        descriptionHelpText
        addressHelpText
        proposalInAZoneRequired
      }
    }
  `,
);
